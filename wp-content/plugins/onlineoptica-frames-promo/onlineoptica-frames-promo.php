<?php
/**
 * Plugin Name: OnlineOptica Frames Promo
 * Description: Admin-configurable WooCommerce promotion for frames by date range and category.
 * Version: 1.1.2
 * Author: OnlineOptica
 */

if (!defined('ABSPATH')) {
	exit;
}

final class OO_Frames_Promo_Plugin {
	const OPTION_KEY = 'oo_frames_promo_settings';
	const MENU_SLUG  = 'oo-frames-promo';

	public function __construct() {
		add_action('admin_menu', [$this, 'add_admin_menu']);
		add_action('admin_init', [$this, 'register_settings']);
		add_action('woocommerce_before_calculate_totals', [$this, 'apply_discount_to_cart'], 999, 1);
		add_action('woocommerce_cart_totals_before_order_total', [$this, 'render_cart_notice']);
		add_action('rest_api_init', [$this, 'register_rest_routes']);
	}

	public function get_default_settings() {
		return [
			'enabled'          => '0',
			'discount_percent' => '10',
			'start_datetime'   => '',
			'end_datetime'     => '',
			'category_slugs'   => "диоптрични-рамки\nдамски-рамки\nмъжки-рамки\nдетски-рамки\nдамскирамкиkwiat\nмъжкирамкиkwiat",
			'notice_text'      => 'Промоция: автоматична отстъпка за диоптрични рамки',
		];
	}

	public function get_settings() {
		$saved = get_option(self::OPTION_KEY, []);
		return wp_parse_args($saved, $this->get_default_settings());
	}

	public function add_admin_menu() {
		add_menu_page(
			'Frames Promo',
			'Frames Promo',
			'manage_woocommerce',
			self::MENU_SLUG,
			[$this, 'render_settings_page'],
			'dashicons-tag',
			56
		);
	}

	public function register_settings() {
		register_setting(
			'oo_frames_promo_group',
			self::OPTION_KEY,
			[$this, 'sanitize_settings']
		);

		add_settings_section(
			'oo_frames_promo_main_section',
			'Настройки на промоцията',
			function () {
				echo '<p>Настройки за автоматична отстъпка на диоптрични рамки.</p>';
			},
			self::MENU_SLUG
		);

		add_settings_field(
			'enabled',
			'Активна промоция',
			[$this, 'render_enabled_field'],
			self::MENU_SLUG,
			'oo_frames_promo_main_section'
		);

		add_settings_field(
			'discount_percent',
			'Процент отстъпка',
			[$this, 'render_discount_field'],
			self::MENU_SLUG,
			'oo_frames_promo_main_section'
		);

		add_settings_field(
			'start_datetime',
			'Начална дата и час',
			[$this, 'render_start_datetime_field'],
			self::MENU_SLUG,
			'oo_frames_promo_main_section'
		);

		add_settings_field(
			'end_datetime',
			'Крайна дата и час',
			[$this, 'render_end_datetime_field'],
			self::MENU_SLUG,
			'oo_frames_promo_main_section'
		);

		add_settings_field(
			'category_slugs',
			'Категории (slug, по един на ред)',
			[$this, 'render_category_slugs_field'],
			self::MENU_SLUG,
			'oo_frames_promo_main_section'
		);

		add_settings_field(
			'notice_text',
			'Текст в количката',
			[$this, 'render_notice_text_field'],
			self::MENU_SLUG,
			'oo_frames_promo_main_section'
		);
	}

	public function sanitize_settings($input) {
		$defaults = $this->get_default_settings();

		$output = [];
		$output['enabled'] = isset($input['enabled']) ? '1' : '0';

		$discount = isset($input['discount_percent']) ? (float) $input['discount_percent'] : (float) $defaults['discount_percent'];
		if ($discount < 0) {
			$discount = 0;
		}
		if ($discount > 90) {
			$discount = 90;
		}
		$output['discount_percent'] = (string) $discount;

		$output['start_datetime'] = isset($input['start_datetime']) ? sanitize_text_field($input['start_datetime']) : '';
		$output['end_datetime']   = isset($input['end_datetime']) ? sanitize_text_field($input['end_datetime']) : '';

		$output['category_slugs'] = isset($input['category_slugs'])
			? sanitize_textarea_field($input['category_slugs'])
			: $defaults['category_slugs'];

		$output['notice_text'] = isset($input['notice_text'])
			? sanitize_text_field($input['notice_text'])
			: $defaults['notice_text'];

		if (!empty($output['start_datetime']) && !empty($output['end_datetime'])) {
			$start_ts = strtotime($output['start_datetime']);
			$end_ts   = strtotime($output['end_datetime']);

			if ($start_ts && $end_ts && $end_ts < $start_ts) {
				add_settings_error(
					self::OPTION_KEY,
					'oo_frames_promo_date_error',
					'Крайната дата трябва да е след началната.'
				);
			}
		}

		return $output;
	}

	public function render_enabled_field() {
		$settings = $this->get_settings();
		?>
		<label>
			<input type="checkbox" name="<?php echo esc_attr(self::OPTION_KEY); ?>[enabled]" value="1" <?php checked($settings['enabled'], '1'); ?>>
			Включи промоцията
		</label>
		<?php
	}

	public function render_discount_field() {
		$settings = $this->get_settings();
		?>
		<input
			type="number"
			step="0.01"
			min="0"
			max="90"
			name="<?php echo esc_attr(self::OPTION_KEY); ?>[discount_percent]"
			value="<?php echo esc_attr($settings['discount_percent']); ?>"
			class="small-text"
		> %
		<p class="description">Пример: 10 или 15</p>
		<?php
	}

	public function render_start_datetime_field() {
		$settings = $this->get_settings();
		?>
		<input
			type="datetime-local"
			name="<?php echo esc_attr(self::OPTION_KEY); ?>[start_datetime]"
			value="<?php echo esc_attr($this->format_for_datetime_local($settings['start_datetime'])); ?>"
		>
		<p class="description">Часовата зона е тази на WordPress сайта.</p>
		<?php
	}

	public function render_end_datetime_field() {
		$settings = $this->get_settings();
		?>
		<input
			type="datetime-local"
			name="<?php echo esc_attr(self::OPTION_KEY); ?>[end_datetime]"
			value="<?php echo esc_attr($this->format_for_datetime_local($settings['end_datetime'])); ?>"
		>
		<p class="description">Промоцията ще важи до този момент.</p>
		<?php
	}

	public function render_category_slugs_field() {
		$settings = $this->get_settings();
		?>
		<textarea
			name="<?php echo esc_attr(self::OPTION_KEY); ?>[category_slugs]"
			rows="8"
			cols="50"
			class="large-text code"
		><?php echo esc_textarea($settings['category_slugs']); ?></textarea>
		<p class="description">По един slug на ред. Ако продуктът е в някоя от тези категории, ще получи промоция.</p>
		<?php
	}

	public function render_notice_text_field() {
		$settings = $this->get_settings();
		?>
		<input
			type="text"
			name="<?php echo esc_attr(self::OPTION_KEY); ?>[notice_text]"
			value="<?php echo esc_attr($settings['notice_text']); ?>"
			class="regular-text"
		>
		<?php
	}

	private function format_for_datetime_local($value) {
		if (empty($value)) {
			return '';
		}

		$ts = strtotime($value);
		if (!$ts) {
			return '';
		}

		return date('Y-m-d\TH:i', $ts);
	}

	private function get_category_slugs_array($settings) {
		$lines = preg_split('/\r\n|\r|\n/', (string) $settings['category_slugs']);
		$lines = array_map('trim', $lines);
		$lines = array_filter($lines);
		return array_values($lines);
	}

	private function is_promo_active($settings) {
		if ($settings['enabled'] !== '1') {
			return false;
		}

		if (empty($settings['start_datetime']) || empty($settings['end_datetime'])) {
			return false;
		}

		$start_ts = strtotime($settings['start_datetime']);
		$end_ts   = strtotime($settings['end_datetime']);
		$now_ts   = current_time('timestamp');

		if (!$start_ts || !$end_ts) {
			return false;
		}

		return ($now_ts >= $start_ts && $now_ts <= $end_ts);
	}

	private function normalize_slug_value($value) {
		$value = trim((string) $value);

		$decoded = rawurldecode($value);
		if ($decoded !== '') {
			$value = $decoded;
		}

		if (function_exists('mb_strtolower')) {
			$value = mb_strtolower($value, 'UTF-8');
		} else {
			$value = strtolower($value);
		}

		return $value;
	}

	private function product_matches_categories($product_id, $category_slugs) {
		if (empty($category_slugs)) {
			return false;
		}

		$wanted = array_map([$this, 'normalize_slug_value'], $category_slugs);
		$wanted = array_values(array_unique(array_filter($wanted)));

		$terms = get_the_terms($product_id, 'product_cat');

		if (empty($terms) || is_wp_error($terms)) {
			error_log('OO PROMO: no terms found for product ID=' . $product_id);
			return false;
		}

		$all_slugs = [];

		foreach ($terms as $term) {
			$all_slugs[] = $this->normalize_slug_value($term->slug);

			$ancestors = get_ancestors($term->term_id, 'product_cat');
			if (!empty($ancestors)) {
				foreach ($ancestors as $ancestor_id) {
					$ancestor = get_term($ancestor_id, 'product_cat');
					if ($ancestor && !is_wp_error($ancestor)) {
						$all_slugs[] = $this->normalize_slug_value($ancestor->slug);
					}
				}
			}
		}

		$all_slugs = array_values(array_unique(array_filter($all_slugs)));

		error_log('OO PROMO PRODUCT TERMS ID=' . $product_id . ' SLUGS=' . implode(', ', $all_slugs));

		foreach ($wanted as $slug) {
			if (in_array($slug, $all_slugs, true)) {
				return true;
			}
		}

		return false;
	}

	public function apply_discount_to_cart($cart) {
		if (is_admin() && !defined('DOING_AJAX')) {
			return;
		}

		if (!$cart || !is_a($cart, 'WC_Cart')) {
			return;
		}

		$settings = $this->get_settings();

		if (!$this->is_promo_active($settings)) {
			error_log('OO PROMO: inactive promo');
			return;
		}

		$discount_percent = (float) $settings['discount_percent'];
		if ($discount_percent <= 0) {
			error_log('OO PROMO: invalid discount percent');
			return;
		}

		$category_slugs = $this->get_category_slugs_array($settings);
		error_log('OO PROMO: category slugs = ' . print_r($category_slugs, true));

		foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
			if (empty($cart_item['data']) || !is_a($cart_item['data'], 'WC_Product')) {
				error_log('OO PROMO: invalid cart item data');
				continue;
			}

			$product = $cart_item['data'];
			$product_id = $product->get_id();
			$check_product_id = $product_id;

			if ($product->is_type('variation')) {
				$check_product_id = $product->get_parent_id();
			}

			error_log('OO PROMO CHECK: ID=' . $check_product_id . ' NAME=' . $product->get_name());

			if (!$this->product_matches_categories($check_product_id, $category_slugs)) {
				error_log('OO PROMO NO CATEGORY MATCH: ID=' . $check_product_id);
				continue;
			}

			error_log('OO PROMO CATEGORY MATCH: ID=' . $check_product_id);

			if ($product->is_on_sale()) {
				error_log('OO PROMO SKIP SALE PRODUCT: ID=' . $check_product_id);
				continue;
			}

			$regular_price = (float) $product->get_regular_price();
			$current_price = (float) $product->get_price();

			error_log('OO PROMO PRICES BEFORE: ID=' . $check_product_id . ' REGULAR=' . $regular_price . ' CURRENT=' . $current_price);

			if ($regular_price <= 0) {
				error_log('OO PROMO SKIP: no regular price');
				continue;
			}

			$discounted_frame_price = $regular_price * (1 - ($discount_percent / 100));
			$discounted_frame_price = (float) wc_format_decimal($discounted_frame_price, wc_get_price_decimals());

			$addon_extra = max(0, $current_price - $regular_price);

			$new_price = $discounted_frame_price + $addon_extra;
			$new_price = (float) wc_format_decimal($new_price, wc_get_price_decimals());

			error_log(
				'OO PROMO APPLY: ID=' . $check_product_id .
				' REGULAR=' . $regular_price .
				' CURRENT=' . $current_price .
				' ADDON=' . $addon_extra .
				' NEW=' . $new_price
			);

			$product->set_price($new_price);
		}
	}

	public function render_cart_notice() {
		$settings = $this->get_settings();

		if (!$this->is_promo_active($settings)) {
			return;
		}

		$text = trim((string) $settings['notice_text']);
		if ($text === '') {
			return;
		}

		echo '<tr class="oo-frames-promo-notice">';
		echo '<th>' . esc_html__('Промоция', 'onlineoptica-frames-promo') . '</th>';
		echo '<td style="color:#c62828;font-weight:600;">' . esc_html($text) . '</td>';
		echo '</tr>';
	}

	public function register_rest_routes() {
		register_rest_route('onlineoptica/v1', '/promo', [
			'methods'  => 'GET',
			'callback' => [$this, 'rest_get_promo'],
			'permission_callback' => '__return_true',
		]);
	}

	public function rest_get_promo() {
		$settings = $this->get_settings();

		return rest_ensure_response([
			'enabled'    => $settings['enabled'] === '1',
			'percent'    => (float) $settings['discount_percent'],
			'start'      => (string) $settings['start_datetime'],
			'end'        => (string) $settings['end_datetime'],
			'categories' => $this->get_category_slugs_array($settings),
			'active'     => $this->is_promo_active($settings),
			'notice'     => (string) $settings['notice_text'],
		]);
	}

	public function render_settings_page() {
		if (!current_user_can('manage_woocommerce')) {
			return;
		}

		$settings = $this->get_settings();
		$is_active = $this->is_promo_active($settings);
		?>
		<div class="wrap">
			<h1>Frames Promo</h1>

			<?php settings_errors(self::OPTION_KEY); ?>

			<div style="margin:16px 0;padding:12px 14px;border:1px solid #dcdcde;background:#fff;">
				<strong>Статус:</strong>
				<?php if ($is_active): ?>
					<span style="color:green;font-weight:700;">Активна</span>
				<?php else: ?>
					<span style="color:#777;font-weight:700;">Неактивна</span>
				<?php endif; ?>
			</div>

			<form method="post" action="options.php">
				<?php
				settings_fields('oo_frames_promo_group');
				do_settings_sections(self::MENU_SLUG);
				submit_button('Запази настройките');
				?>
			</form>

			<hr style="margin:24px 0;">

			<h2>REST endpoint за Next.js</h2>
			<p>
				<code><?php echo esc_html(rest_url('onlineoptica/v1/promo')); ?></code>
			</p>
		</div>
		<?php
	}
}

new OO_Frames_Promo_Plugin();
