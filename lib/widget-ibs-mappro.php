<?php

class IBS_WMappro extends WP_Widget {

    public function __construct() {
        $widget_ops = array(
            'class' => 'ibs_wmappro',
            'description' => 'A widget to display a Google Map'
        );

        parent::__construct(
                'ibs_wmappro', 'IBS Mappro', $widget_ops
        );
    }

    public function form($instance) {
        $widget_defaults = array(
            'title' => 'IBS Mappro',
            'streetview' => 'no',
            'maptype' => 'no',
            'zoom' => 'no',
            'scroll' => 'no',
            'drag' => 'no',
            'map_height' => 300,
            'map_width' => 300,
            'map_url' => ''
        );

        $instance = wp_parse_args((array) $instance, $widget_defaults);
        $args = get_option('ibs_mappro_options');
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php echo'Title'; ?></label>
            <input type="text" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" class="widefat" value="<?php echo esc_attr($instance['title']); ?>"/>
        </p>
        <p></p>
        <div class="widefat"><label for="<?php echo $this->get_field_id('drag'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Draggable'; ?></span>
                <input type="checkbox" id="<?php echo $this->get_field_id('drag'); ?>" name="<?php echo $this->get_field_name('drag'); ?>" <?php echo esc_attr($instance['drag']) === 'yes' ? 'checked' : ''; ?> value="yes">
            </label></div>
        <p></p>
        <div class="widefat"><label for="<?php echo $this->get_field_id('maptype'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Map Types'; ?></span>
                <input type="checkbox" id="<?php echo $this->get_field_id('maptype'); ?>" name="<?php echo $this->get_field_name('maptype'); ?>" <?php echo esc_attr($instance['maptype']) === 'yes' ? 'checked' : ''; ?> value="yes">
            </label></div>

        <p></p>
        <div class="widefat"><label for="<?php echo $this->get_field_id('scroll'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Scrollwheel'; ?></span>
                <input type="checkbox" id="<?php echo $this->get_field_id('scroll'); ?>" name="<?php echo $this->get_field_name('scroll'); ?>" <?php echo esc_attr($instance['scroll']) === 'yes' ? 'checked' : ''; ?> value="yes">
            </label></div>
        <p></p>
        <div class="widefat"><label for="<?php echo $this->get_field_id('streetview'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Streetview'; ?></span>
                <input type="checkbox" id="<?php echo $this->get_field_id('streetview'); ?>" name="<?php echo $this->get_field_name('streetview'); ?>" <?php echo esc_attr($instance['streetview']) === 'yes' ? 'checked' : ''; ?> value="yes">
            </label></div>
        <p></p>
        <div class="widefat"><label for="<?php echo $this->get_field_id('zoom'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Zoom'; ?></span>
                <input type="checkbox" id="<?php echo $this->get_field_id('zoom'); ?>" name="<?php echo $this->get_field_name('zoom'); ?>" <?php echo esc_attr($instance['zoom']) === 'yes' ? 'checked' : ''; ?> value="yes">
            </label></div>
        <p></p>
        <div class="widefat">
            <label for="<?php echo $this->get_field_id('map_height'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Map height'; ?></span>
                <input type="number" min=200 max=600 id="<?php echo $this->get_field_id('map_height'); ?>" name="<?php echo $this->get_field_name('map_height'); ?>"  value="<?php echo esc_attr($instance['map_height']); ?>"/>
            </label>
        </div>
        <p></p>
        <div class="widefat">
            <label for="<?php echo $this->get_field_id('map_width'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Map width'; ?></span>
                <input type="number" min=200 max=600 id="<?php echo $this->get_field_id('map_width'); ?>" name="<?php echo $this->get_field_name('map_width'); ?>"  value="<?php echo esc_attr($instance['map_width']); ?>"/>
            </label>
        </div>
        <p></p> 
        <div class="widefat">
            <label for="<?php echo $this->get_field_id('map_url'); ?>"><span  style="display:inline-block; width:100px;"><?php echo 'Map Name'; ?></span>
                <select id="<?php echo $this->get_field_id('map_url'); ?>" name="<?php echo $this->get_field_name('map_url'); ?>" >
                    <?php
                    $dir = IBS_MAPPRO::libPath() . 'maps/widgets/';
                    $files = IBS_MAPPRO::get_files($dir);
                    foreach ($files as $file) {
                        $pinfo = pathinfo($file);
                        $name = $pinfo['filename'];
                        echo "<option value='$file' >$name</option>";
                    }
                    ?>
                </select>
            </label>
        </div>
        <p></p>
        <?PHP
    }

    public function update($new_instance, $old_instance) {
        $old_instance = $new_instance;

        $instance['title'] = $new_instance['title'];

        return $old_instance;
    }

    public function widget($widget_args, $instance) {
        extract($widget_args);
        $drag = $instance['drag'] === 'yes' ? 'true' : 'false';
        $maptype = $instance['maptype'] === 'yes' ? 'true' : 'false';
        $scroll = $instance['scroll'] === 'yes' ? 'true' : 'false';
        $streetview = $instance['streetview'] === 'yes' ? 'true' : 'false';
        $zoom = $instance['zoom'] === 'yes' ? 'true' : 'false';
        $title = apply_filters('widget_title', $instance['title']);
        echo $before_widget;
        if (1==2 && $title) {
            echo $before_title . $title . $after_title;
        }
        IBS_MAPPRO::$add_script += 1;
        $div = 'ibs-map-' . IBS_MAPPRO::$add_script;
        $width = $instance['map_width'] . 'px';
        $height = $instance['map_height'] . 'px';
        $maps = IBS_MAPPRO::libUrl() . 'maps/widgets/' . $instance['map_url'];

        echo "<a class='ibs-img-loading' style='padding-left:20px;' href='#' id='$div-trigger' >$div</a><br/>";
        echo "<div class='google-map-div' id='$div' style='width:$width; height:$height;' ></div>";
        ?>
        <script type="text/javascript">
            jQuery(document).ready(function ($) {
                console.log('run');
                new IBS_MAPPRO(
                        {
                            drag: <?php echo $drag; ?>,
                            maptype: <?php echo $maptype; ?>,
                            scroll: <?php echo $scroll; ?>,
                            streetview: <?php echo $streetview; ?>,
                            zoom:<?php echo $zoom; ?>,
                            admin: false,
                            controls: false,
                            list: false,
                            markerManager: false,
                            search: false,
                            elevation: false,
                            ajax: "<?php echo admin_url('admin-ajax.php'); ?>",
                            url: "<?php echo IBS_MAPPRO::getUrl(); ?>",
                            path: "<?php echo IBS_MAPPRO::getPath(); ?>",
                            liburl: "<?php echo IBS_MAPPRO::libUrl(); ?>",
                            libpath: "<?php echo IBS_MAPPRO::libPath(); ?>",
                            nonce: "<?php echo wp_create_nonce('966916'); ?>",
                            sn: "<?php echo IBS_MAPPRO::$add_script; ?>",
                            title: "<?php echo $title; ?>",
                            tag: "",
                            div: $('#<?php echo $div; ?>'),
                            maps: "<?php echo $maps; ?>",
                            debug: false
                        });
            });
        </script>
        <?php
        echo $after_widget;
    }

}

function ibs_register_mappro_widget() {
    register_widget('IBS_WMappro');
}

add_action('widgets_init', 'ibs_register_mappro_widget');
