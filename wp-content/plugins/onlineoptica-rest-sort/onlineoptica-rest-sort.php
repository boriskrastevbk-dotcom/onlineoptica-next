<?php
/**
 * Plugin Name: OnlineOptica REST Sort
 * Description: Adds custom sort support for WooCommerce REST products endpoint.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter('woocommerce_rest_product_object_query', function ($args, $request) {
    $sort = $request->get_param('oo_sort');

    if (!$sort) {
        return $args;
    }

    switch ($sort) {
        case 'price_asc':
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_price';
            $args['order'] = 'ASC';
            break;

        case 'price_desc':
            $args['orderby'] = 'meta_value_num';
            $args['meta_key'] = '_price';
            $args['order'] = 'DESC';
            break;

        case 'name_asc':
            $args['orderby'] = 'title';
            $args['order'] = 'ASC';
            break;

        case 'name_desc':
            $args['orderby'] = 'title';
            $args['order'] = 'DESC';
            break;

        case 'old':
            $args['orderby'] = 'date';
            $args['order'] = 'ASC';
            break;

        case 'new':
        default:
            $args['orderby'] = 'date';
            $args['order'] = 'DESC';
            break;
    }

    return $args;
}, 10, 2);
