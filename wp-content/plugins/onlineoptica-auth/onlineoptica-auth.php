<?php
/**
 * Plugin Name: OnlineOptica Auth API
 * Description: Minimal auth endpoints for headless Next.js (HttpOnly cookie sessions).
 * Version: 0.1.0
 */

if (!defined('ABSPATH')) exit;

class OO_Auth_API {
  const COOKIE_NAME = 'oo_sess';
  const TOKEN_TTL   = 1209600; // 14 days

  public static function init() {
    add_action('rest_api_init', [__CLASS__, 'routes']);
    add_action('init', [__CLASS__, 'maybe_bootstrap_session']);
  }

  public static function routes() {
    register_rest_route('onlineoptica/v1', '/login', [
      'methods'  => 'POST',
      'callback' => [__CLASS__, 'login'],
      'permission_callback' => '__return_true',
    ]);

    register_rest_route('onlineoptica/v1', '/logout', [
      'methods'  => 'POST',
      'callback' => [__CLASS__, 'logout'],
      'permission_callback' => '__return_true',
    ]);

    register_rest_route('onlineoptica/v1', '/me', [
      'methods'  => 'GET',
      'callback' => [__CLASS__, 'me'],
      'permission_callback' => '__return_true',
    ]);

    register_rest_route('onlineoptica/v1', '/profile', [
      'methods'  => 'POST',
      'callback' => [__CLASS__, 'profile'],
      'permission_callback' => '__return_true',
    ]);

    register_rest_route('onlineoptica/v1', '/orders', [
      'methods'  => 'GET',
      'callback' => [__CLASS__, 'orders'],
      'permission_callback' => '__return_true',
    ]);

    register_rest_route('onlineoptica/v1', '/forgot-password', [
      'methods'  => 'POST',
      'callback' => [__CLASS__, 'forgot_password'],
      'permission_callback' => '__return_true',
    ]);

    register_rest_route('onlineoptica/v1', '/reset-password', [
      'methods'  => 'POST',
      'callback' => [__CLASS__, 'reset_password'],
      'permission_callback' => '__return_true',
    ]);
  }

  public static function maybe_bootstrap_session() {
    if (is_user_logged_in()) return;
    if (empty($_COOKIE[self::COOKIE_NAME])) return;

    $token = sanitize_text_field(wp_unslash($_COOKIE[self::COOKIE_NAME]));
    $uid = self::validate_token($token);
    if ($uid) {
      wp_set_current_user($uid);
    }
  }

  public static function login(WP_REST_Request $req) {
    $body = $req->get_json_params();
    $login = isset($body['login']) ? trim((string)$body['login']) : '';
    $password = isset($body['password']) ? (string)$body['password'] : '';

    if ($login === '' || $password === '') {
      return new WP_REST_Response(['ok' => false, 'error' => 'missing_credentials'], 400);
    }

    if (is_email($login)) {
      $u = get_user_by('email', $login);
      $username = $u ? $u->user_login : $login;
    } else {
      $username = $login;
    }

    $creds = [
      'user_login'    => $username,
      'user_password' => $password,
      'remember'      => true,
    ];

    $user = wp_signon($creds, is_ssl());
    if (is_wp_error($user)) {
      return new WP_REST_Response(['ok' => false, 'error' => 'invalid_credentials'], 401);
    }

    $token = self::issue_token($user->ID);
    self::set_cookie($token, $user->ID);

    return new WP_REST_Response([
      'ok' => true,
      'token' => $token,
      'user' => self::user_payload($user),
    ], 200);
  }

  public static function logout(WP_REST_Request $req) {
    self::clear_cookie();
    wp_logout();
    return new WP_REST_Response(['ok' => true], 200);
  }

  public static function me(WP_REST_Request $req) {
    $user = self::require_user($req);
    if (is_wp_error($user)) return $user;

    return new WP_REST_Response([
      'ok' => true,
      'user' => self::user_payload($user),
    ], 200);
  }

  public static function profile(WP_REST_Request $req) {
    $user = self::require_user($req);
    if (is_wp_error($user)) return $user;

    $body = $req->get_json_params();
    $first_name = isset($body['first_name']) ? sanitize_text_field((string)$body['first_name']) : '';
    $last_name  = isset($body['last_name']) ? sanitize_text_field((string)$body['last_name']) : '';
    $phone      = isset($body['phone']) ? sanitize_text_field((string)$body['phone']) : '';
    $city       = isset($body['city']) ? sanitize_text_field((string)$body['city']) : '';
    $address_1  = isset($body['address_1']) ? sanitize_text_field((string)$body['address_1']) : '';
    $postcode   = isset($body['postcode']) ? sanitize_text_field((string)$body['postcode']) : '';

    wp_update_user([
      'ID'           => $user->ID,
      'first_name'   => $first_name,
      'last_name'    => $last_name,
      'display_name' => trim($first_name . ' ' . $last_name) ?: $user->display_name,
    ]);

    update_user_meta($user->ID, 'billing_first_name', $first_name);
    update_user_meta($user->ID, 'billing_last_name', $last_name);
    update_user_meta($user->ID, 'billing_phone', $phone);
    update_user_meta($user->ID, 'billing_city', $city);
    update_user_meta($user->ID, 'billing_address_1', $address_1);
    update_user_meta($user->ID, 'billing_postcode', $postcode);

    update_user_meta($user->ID, 'shipping_first_name', $first_name);
    update_user_meta($user->ID, 'shipping_last_name', $last_name);
    update_user_meta($user->ID, 'shipping_city', $city);
    update_user_meta($user->ID, 'shipping_address_1', $address_1);
    update_user_meta($user->ID, 'shipping_postcode', $postcode);

    $fresh_user = get_user_by('id', $user->ID);

    return new WP_REST_Response([
      'ok' => true,
      'user' => self::user_payload($fresh_user),
    ], 200);
  }

  public static function orders(WP_REST_Request $req) {
    $user = self::require_user($req);
    if (is_wp_error($user)) return $user;

    if (!class_exists('WC_Order_Query')) {
      return new WP_REST_Response(['ok' => false, 'error' => 'woocommerce_not_found'], 500);
    }

    $page_param = $req->get_param('page');
    $per_page_param = $req->get_param('per_page');

    $page = max(1, (int)($page_param ?: 1));
    $per_page = min(20, max(1, (int)($per_page_param ?: 20)));
    $email = $user->user_email;

    $q = new WC_Order_Query([
      'customer' => [$user->ID, $email],
      'limit'    => $per_page,
      'paged'    => $page,
      'orderby'  => 'date',
      'order'    => 'DESC',
      'return'   => 'objects',
    ]);

    $orders = $q->get_orders();

    $out = array_map(function($o) {
      /** @var WC_Order $o */

      $items = array_map(function($it) {
        /** @var WC_Order_Item_Product $it */

        $meta_data = [];

        foreach ($it->get_meta_data() as $meta) {
          if (!is_object($meta) || !isset($meta->key)) continue;

          $key = (string)$meta->key;
          $value = $meta->value;

          if ($key === '' || strpos($key, '_') === 0) continue;

          if (is_array($value) || is_object($value)) {
            $value = wp_json_encode($value, JSON_UNESCAPED_UNICODE);
          } else {
            $value = (string)$value;
          }

          $meta_data[] = [
            'key'   => $key,
            'value' => $value,
          ];
        }

        $lens_label = '';
        foreach ($meta_data as $m) {
          if (($m['key'] ?? '') === 'Стъкла') {
            $lens_label = (string)($m['value'] ?? '');
            break;
          }
        }

        return [
          'name'      => $it->get_name(),
          'qty'       => (int)$it->get_quantity(),
          'total'     => (string)$it->get_total(),
          'lenses'    => $lens_label,
          'meta_data' => $meta_data,
        ];
      }, $o->get_items());

      return [
        'id'           => $o->get_id(),
        'number'       => $o->get_order_number(),
        'status'       => $o->get_status(),
        'total'        => $o->get_total(),
        'currency'     => $o->get_currency(),
        'date_created' => $o->get_date_created() ? $o->get_date_created()->date('c') : null,
        'items'        => array_values($items),
      ];
    }, $orders);

    return new WP_REST_Response(['ok' => true, 'orders' => $out], 200);
  }

  public static function forgot_password(WP_REST_Request $req) {
    $body = $req->get_json_params();
    $login = isset($body['login']) ? trim((string)$body['login']) : '';

    if ($login === '') {
      return new WP_REST_Response(['ok' => false, 'error' => 'missing_login'], 400);
    }

    if (is_email($login)) {
      $user = get_user_by('email', $login);
    } else {
      $user = get_user_by('login', $login);
    }

    if (!$user || !($user instanceof WP_User)) {
      return new WP_REST_Response(['ok' => true], 200);
    }

    $result = retrieve_password($user->user_login);

    if (is_wp_error($result)) {
      return new WP_REST_Response([
        'ok' => false,
        'error' => 'forgot_password_failed',
        'details' => $result->get_error_message(),
      ], 500);
    }

    return new WP_REST_Response(['ok' => true], 200);
  }

  public static function reset_password(WP_REST_Request $req) {
    $body = $req->get_json_params();

    $login = isset($body['login']) ? trim((string)$body['login']) : '';
    $key = isset($body['key']) ? trim((string)$body['key']) : '';
    $password = isset($body['password']) ? (string)$body['password'] : '';

    if ($login === '' || $key === '' || $password === '') {
      return new WP_REST_Response(['ok' => false, 'error' => 'missing_fields'], 400);
    }

    if (strlen($password) < 8) {
      return new WP_REST_Response(['ok' => false, 'error' => 'weak_password'], 400);
    }

    $user = check_password_reset_key($key, $login);

    if (is_wp_error($user)) {
      return new WP_REST_Response(['ok' => false, 'error' => 'invalid_or_expired_key'], 400);
    }

    reset_password($user, $password);

    return new WP_REST_Response(['ok' => true], 200);
  }

  private static function user_payload($user) {
    if (!$user || !($user instanceof WP_User)) return null;

    $first_name = get_user_meta($user->ID, 'billing_first_name', true);
    if ($first_name === '') $first_name = get_user_meta($user->ID, 'first_name', true);

    $last_name = get_user_meta($user->ID, 'billing_last_name', true);
    if ($last_name === '') $last_name = get_user_meta($user->ID, 'last_name', true);

    $pretty_name = trim($first_name . ' ' . $last_name);
    if ($pretty_name === '') {
      $pretty_name = $user->display_name ?: $user->user_login;
    }

    return [
      'id'         => (int)$user->ID,
      'email'      => $user->user_email,
      'name'       => (string)$pretty_name,
      'first_name' => (string)$first_name,
      'last_name'  => (string)$last_name,
      'phone'      => (string)get_user_meta($user->ID, 'billing_phone', true),
      'city'       => (string)get_user_meta($user->ID, 'billing_city', true),
      'address_1'  => (string)get_user_meta($user->ID, 'billing_address_1', true),
      'postcode'   => (string)get_user_meta($user->ID, 'billing_postcode', true),
    ];
  }

  private static function require_user(WP_REST_Request $req) {
    if (is_user_logged_in()) {
      $u = wp_get_current_user();
      if ($u && $u->ID) return $u;
    }

    $auth = (string)$req->get_header('authorization');
    if ($auth && stripos($auth, 'Bearer ') === 0) {
      $token = trim(substr($auth, 7));
      if ($token !== '') {
        $uid = self::validate_token($token);
        if ($uid) {
          wp_set_current_user($uid);
          $u = wp_get_current_user();
          if ($u && $u->ID) return $u;
        }
      }
    }

    if (!empty($_COOKIE[self::COOKIE_NAME])) {
      $token = sanitize_text_field(wp_unslash($_COOKIE[self::COOKIE_NAME]));
      $uid = self::validate_token($token);
      if ($uid) {
        wp_set_current_user($uid);
        $u = wp_get_current_user();
        if ($u && $u->ID) return $u;
      }
    }

    return new WP_Error('oo_unauthorized', 'Unauthorized', ['status' => 401]);
  }

  private static function issue_token($user_id) {
    $token = wp_generate_password(48, false, false);
    $hash = wp_hash_password($token);

    update_user_meta($user_id, 'oo_sess_hash', $hash);
    update_user_meta($user_id, 'oo_sess_exp', time() + self::TOKEN_TTL);

    return $token;
  }

  private static function validate_token($token) {
    $key = 'oo_sess_' . hash('sha256', $token);
    $uid = get_transient($key);

    if ($uid) {
      $uid = (int)$uid;
      $exp = (int)get_user_meta($uid, 'oo_sess_exp', true);
      $hash = (string)get_user_meta($uid, 'oo_sess_hash', true);

      if ($exp > time() && $hash && wp_check_password($token, $hash, $uid)) {
        return $uid;
      }

      delete_transient($key);
      return 0;
    }

    return 0;
  }

  private static function set_cookie($token, $user_id) {
    $secure  = is_ssl();
    $path    = defined('COOKIEPATH') ? COOKIEPATH : '/';
    $domain  = defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '';
    $expires = time() + self::TOKEN_TTL;

    $uid = (int)$user_id;
    $key = 'oo_sess_' . hash('sha256', $token);
    set_transient($key, $uid, self::TOKEN_TTL);

    setcookie(self::COOKIE_NAME, $token, [
      'expires'  => $expires,
      'path'     => $path,
      'domain'   => $domain,
      'secure'   => $secure,
      'httponly' => true,
      'samesite' => 'Lax',
    ]);
  }

  private static function clear_cookie() {
    $path   = defined('COOKIEPATH') ? COOKIEPATH : '/';
    $domain = defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '';

    setcookie(self::COOKIE_NAME, '', [
      'expires'  => time() - 3600,
      'path'     => $path,
      'domain'   => $domain,
      'secure'   => is_ssl(),
      'httponly' => true,
      'samesite' => 'Lax',
    ]);
  }
}

OO_Auth_API::init();
