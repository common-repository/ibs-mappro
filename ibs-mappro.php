<?php
/*
  Plugin Name: IBS Mappro
  Plugin URI: http://wordpress.org/extend/plugins/
  Description: implements Google Maps API V3 for Wordpress Adimin and shortcode.
  Author: Harry Moore
  Version: 3.0
  Author URI: http://indianbendsolutions.com
  License: GPLv2 or later
  License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */
if (!function_exists('json_last_error_msg_x')) {

    function json_last_error_msg_x() {
        static $errors = array(
            JSON_ERROR_NONE => null,
            JSON_ERROR_DEPTH => 'Maximum stack depth exceeded',
            JSON_ERROR_STATE_MISMATCH => 'Underflow or the modes mismatch',
            JSON_ERROR_CTRL_CHAR => 'Unexpected control character found',
            JSON_ERROR_SYNTAX => 'Syntax error, malformed JSON',
            JSON_ERROR_UTF8 => 'Malformed UTF-8 characters, possibly incorrectly encoded'
        );
        $error = json_last_error();
        return array_key_exists($error, $errors) ? $errors[$error] : "Unknown error ({$error})";
    }

}

/*
  This program is distributed in the hope that it will be useful, but
  WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */
define('IBS_MAPPRO_VERSION', '3.0');

//
register_activation_hook(__FILE__, 'ibs_mappro_activate');

function ibs_mappro_activate() {
    IBS_MAPPRO::activate();
}

register_deactivation_hook(__FILE__, 'ibs_mappro_deactivate');

function ibs_mappro_deactivate() {
    
}

register_uninstall_hook(__FILE__, 'ibs_mappro_uninstall');

function ibs_mappro_uninstall() {
    return;
}

class IBS_MAPPRO {

    static $add_script = 0;
    static $options = null;

    static function init() {
        self::$options = get_option('ibs_mappro_options');
        add_action('admin_init', array(__CLASS__, 'options_init'));
        add_action('admin_menu', array(__CLASS__, 'add_admin_page'));
        add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueue_admin_scripts'));
        add_shortcode('ibs-mappro', array(__CLASS__, 'handle_shortcode'));
        add_action('init', array(__CLASS__, 'register_script'));
        add_action('wp_head', array(__CLASS__, 'print_script_header'));
        add_action('wp_footer', array(__CLASS__, 'print_script_footer'));
        add_action('admin_print_scripts', array(__CLASS__, 'print_admin_scripts'));
        add_action('wp_enqueue_media', array(__CLASS__, 'enqueue_media_scripts'));
        add_action('media_buttons_context', array(__CLASS__, 'add_media_button'));
        add_action('admin_footer', array(__CLASS__, 'add_media_dialog'));
        add_action('wp_ajax_ibs_mappro_index', array(__CLASS__, 'index'));
        add_action('wp_ajax_nopriv_ibs_mappro_index', array(__CLASS__, 'index'));
        add_shortcode('ibs-mappro', array(__CLASS__, 'handle_shortcode'));
        add_action('admin_init', array(__CLASS__, 'upgrade_check'));
    }

    static function index() {
        $func = $_REQUEST['func'];
        if ($func) {
            $nonce = $_REQUEST['nonce'];
            if (!wp_verify_nonce($nonce, '966916')) {
                exit;
            }
            switch ($func) {
                case 'set_debug':
                    self::set_debug();
                    break;
                case 'set_track':
                    self::set_track();
                    break;
                case 'tracking':
                    self::tracking();
                    break;
                case 'dirs' :
                    self::dirs();
                    break;
                case 'icons':
                    self::icons();
                    break;
                case 'savexml':
                    self::savexml();
                    break;
                case 'folders':
                    self::folders();
                    break;
                case 'CORS':
                    self::CORS();
                    break;
                case 'copy':
                    self::copy();
                    break;
                case 'rename':
                    self::rename();
                    break;
                case 'remove':
                    self::remove();
                    break;
                case 'download':
                    self::download();
                default:
            }
        }
        exit;
    }

    static function file_credentials() {
        global $wp_filesystem;
        $in = true;
        $url = wp_nonce_url('options-general.php?page=filewriting', 'ibs-nonce');
        if (false === ($creds = request_filesystem_credentials($url, '', false, false, null))) {
            $in = false;
        }
        if ($in && !WP_Filesystem($creds)) {
            request_filesystem_credentials($url, '', true, false, null);
            $in = false;
        }
        return $in;
    }

    static function admin_copy($source, $target) {
        global $wp_filesystem;
        if (!is_dir($source)) {
            $wp_filesystem->copy($source, $target, true, FS_CHMOD_FILE);
            return;
        }
        wp_mkdir_p($target);
        $d = dir($source);
        $navFolders = array('.', '..');
        while (false !== ($fileEntry = $d->read() )) {//copy one by one
            if (in_array($fileEntry, $navFolders)) {
                continue;
            }
            $s = "$source/$fileEntry";
            $t = "$target/$fileEntry";
            self::admin_copy($s, $t);
        }
        $d->close();
    }

    static function activate() {
        self::upgrade_check();
    }

    static function activate_failure() {
        ?>
        <div class="updated">
            <p><?php echo 'Activate could not set folders'; ?></p>
        </div>
        <?php
    }

    static function upgrade_check() {
        if (current_user_can('manage_options')) {
            $ver = isset(self::$options['version']) ? self::$options['version'] : '0.0';
            if ($ver !== IBS_MAPPRO_VERSION) {
                if (self::file_credentials()) {
                    if (!file_exists(self::libPath())) {//ibs-files/mappro/'
                        self::admin_copy(plugin_dir_path(__FILE__) . 'mappro/', self::libPath());
                    }
                    if (!file_exists(self::libPath() . 'images/')) {//ibs-files/mappro/image'
                        self::admin_copy(plugin_dir_path(__FILE__) . 'mappro/images/', self::libPath() . 'images/');
                    }
                    if (!file_exists(self::libPath() . 'maps/widgets/')) {//ibs-files/mappro/image'
                        self::admin_copy(plugin_dir_path(__FILE__) . 'mappro/maps/widgets', self::libPath() . 'maps/widgets/');
                    }
                    self::admin_copy(plugin_dir_path(__FILE__) . 'mappro/maps/examples/', self::libPath() . '/maps/examples/');
                    self::$options['version'] = IBS_MAPPRO_VERSION;
                    update_option('ibs_mappro_options', self::$options);
                }
            }
        }
    }

    static function register_script() {
        $min = isset(self::$options['debug']) && self::$options['debug'] === 'off' ? '.min' : '';
        wp_register_style('ibs-map-ui-theme-style', plugins_url("css/smoothness/jquery-ui.min.css", __FILE__));
        wp_register_style("ibs-fineloader-style", plugins_url("js/jquery.fineuploader/css/fineuploader.css", __FILE__));
        wp_register_style("ibs-mappro-style", plugins_url("css/map.css", __FILE__));

        wp_register_style("ibs-ckeditor-style", plugins_url("js/ckeditor_4.5.4_custom/ckeditor/contents.css", __FILE__));
        wp_register_script("ibs-ckeditor-script", plugins_url("js/ckeditor_4.5.4_custom/ckeditor/ckeditor.js", __FILE__), self::$core_handles);
        wp_register_script("ibs-ckeditor-adaptor-script", plugins_url("js/ckeditor_4.5.4_custom/ckeditor/adapters/jquery.js", __FILE__));
        wp_register_script("ibs-print-script", plugins_url("js/jQuery.print/jQuery.print.js", __FILE__));
        wp_register_script("ibs-filedownload-script", plugins_url("js/jquery.filedownload/jquery.filedownload.js", __FILE__));
        wp_register_script("ibs-filetree-script", plugins_url("js/ibs_mappro_filetree$min.js", __FILE__));
        wp_register_script("ibs-fineloader-script", plugins_url("js/jquery.fineuploader/js/jquery.fineuploader.min.js", __FILE__));
        wp_register_script("ibs-scrollto-script", plugins_url("js/ibs_mappro_scrollto$min.js", __FILE__));
        wp_register_script("ibs-mappro-utility-script", plugins_url("js/ibs_mappro_utility$min.js", __FILE__));
        wp_register_script("ibs-mappro-script", plugins_url("js/ibs_mappro$min.js", __FILE__));
        wp_register_script("ibs-mappro-xml-script", plugins_url("js/ibs_mappro_xml$min.js", __FILE__));
        wp_register_script("ibs-mappro-file-script", plugins_url("js/ibs_mappro_file$min.js", __FILE__));
        wp_register_script("ibs-mappro-colorpicker-script", plugins_url("js/ibs_mappro_colorpicker$min.js", __FILE__));
        wp_register_script("ibs-mappro-placemark-script", plugins_url("js/ibs_mappro_placemark$min.js", __FILE__));
        wp_register_script("ibs-mappro-segment-script", plugins_url("js/ibs_mappro_segment$min.js", __FILE__));
        wp_register_script("ibs-mappro-elevation-script", plugins_url("js/ibs_mappro_elevation$min.js", __FILE__));
        wp_register_script("ibs-mappro-handlers-script", plugins_url("js/ibs_mappro_handlers$min.js", __FILE__));
        wp_register_script("ibs-mappro-html-script", plugins_url("js/ibs_mappro_html$min.js", __FILE__));
        wp_register_script("ibs-mappro-media-script", plugins_url("js/ibs_mappro_media$min.js", __FILE__), self::$core_handles);
        wp_register_script("ibs-mappro-library-script", plugins_url("js/ibs_mappro_library$min.js", __FILE__));
        wp_register_script("ibs-mappro-places-script", plugins_url("js/ibs_mappro_places$min.js", __FILE__));

        wp_register_style('ibs-qtip-style', plugins_url("js/jquery.qtip.2.1.1/jquery.qtip.css", __FILE__));
        wp_register_script('ibs-qtip-script', plugins_url("js/jquery.qtip.2.1.1/jquery.qtip.min.js", __FILE__));
    }

    static $core_handles = array(
        'jquery',
        'json2',
        'jquery-color',
        'jquery-ui-core',
        'jquery-ui-widget',
        'jquery-ui-tabs',
        'jquery-ui-sortable',
        'jquery-ui-draggable',
        'jquery-ui-droppable',
        'jquery-ui-selectable',
        'jquery-ui-position',
        'jquery-ui-datepicker',
        'jquery-ui-resizable',
        'jquery-ui-dialog',
        'jquery-ui-button',
        'jquery-ui-spinner'
    );
    static $script_handles = array(
        'ibs-ckeditor-script',
        'ibs-ckeditor-adaptor-script',
        'ibs-filedownload-script',
        'ibs-print-script',
        'ibs-filetree-script',
        'ibs-mappro-colorpicker-script',
        'ibs-fineloader-script',
        'ibs-scrollto-script',
        'ibs-mappro-utility-script',
        'ibs-mappro-xml-script',
        'ibs-mappro-script',
        'ibs-mappro-file-script',
        'ibs-mappro-placemark-script',
        'ibs-mappro-segment-script',
        'ibs-mappro-elevation-script',
        'ibs-mappro-handlers-script',
        'ibs-mappro-html-script',
        'ibs-mappro-media-script',
        'ibs-mappro-library-script',
        'ibs-mappro-places-script',
        'ibs-qtip-script'
    );
    static $style_handles = array(
        'ibs-map-ui-theme-style',
        'ibs-fineloader-style',
        'ibs-mappro-style',
        'ibs-ckeditor-style',
        'ibs-qtip-style'
    );
    static $media_scripts = array(
        'ibs-fineloader-script',
        'ibs-filetree-script',
        'ibs-mappro-media-script'
    );
    static $media_styles = array(
        'ibs-map-ui-theme-style',
        'ibs-fineloader-style',
        'ibs-mappro-style'
    );

    static function enqueue_admin_scripts($page) {
        if ($page === 'settings_page_ibs_mappro') {
            wp_enqueue_style(self::$style_handles);
            wp_enqueue_script(self::$script_handles);
        }
    }

    static function enqueue_media_scripts() {
        wp_enqueue_style(self::$media_styles);
        wp_enqueue_script(self::$media_scripts);
    }

    static function add_media_button($context) {
        $context .= '<button type="button" class="button add_media ibs-media" id="ibs-mappro-insert-media" data-editor="content">'
                . '<span></span> Insert Map</button>';
        return $context;
    }

    static function print_admin_scripts() {
        ?>
        <script src="https://www.google.com/jsapi" type = "text/javascript" ></script>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBwcmfwl7W1aMyo9wnXwmASRfZ0sOhGhRc&libraries=places"></script>
        <script type="text/javascript">google.load("visualization", "1", {packages: ["corechart"]});</script>
        <?PHP
    }

    static function print_script_header() {
        
    }

    static function print_script_footer() {
        if (self::$add_script > 0) {
            self::print_admin_scripts();
            wp_print_styles(self::$style_handles);
            wp_print_scripts(self::$script_handles);
        }
    }

    static function add_media_dialog() {
        ob_start();
        ?>
        <script type = "text/javascript">
            jQuery(document).ready(function ($) {
                var ibsscd = null;
                $('#ibs-mappro-insert-media').on('click', '', {}, function () {
                    if (ibsscd) {
                        delete ibsscd;
                    }
                    ibsscd = new ShortcodeDialog(
                            {
                                ajax: "<?php echo admin_url('admin-ajax.php'); ?>",
                                url: "<?php echo self::getUrl(); ?>",
                                path: "<?php echo self::getPath(); ?>",
                                liburl: "<?php echo self::libUrl(); ?>",
                                libpath: "<?php echo self::libPath(); ?>",
                                nonce: "<?php echo wp_create_nonce('966916'); ?>"
                            })
                })
            });</script>
        <?PHP
        $output = ob_get_contents();
        ob_end_clean();
        echo $output;
    }

    static function options_init() {
        
    }

    static function libPath() {
        $targetA = wp_upload_dir();
        $path = $targetA['basedir'] . '/ibs-files/mappro/';
        return str_replace('\\', '/', $path);
    }

    static function libUrl() {
        $targetA = wp_upload_dir();
        $url = $targetA['baseurl'] . '/ibs-files/mappro/';
        return str_replace('\\', '/', $url);
    }

    static function getPath() {
        $path = plugin_dir_path(__FILE__);
        $path = str_replace('\\', '/', $path);
        return $path;
    }

    static function getUrl() {
        return plugins_url('ibs-mappro/');
    }

    static function add_admin_page() {
        add_options_page('IBS Mappro', 'IBS Mappro', 'manage_options', 'ibs_mappro', array(__CLASS__, 'options_page'));
    }

    static function options_page() {
        $debug = isset(self::$options['debug']) && self::$options['debug'] === 'off' ? 'off' : 'on';
        ob_start();
        ?>
        <script type="text/javascript">
            jQuery(document).ready(function ($) {
                $('#wpbody-content')
                        .append($('<div>').addClass('google-map-div').attr({id: 'ibs-div'}).css({width: '100%'}).height($(window).height() - $('#wpwrap').offset().top - 100));
                new IBS_MAPPRO(
                        {
                            streetview: true,
                            maptype: true,
                            zoom: true,
                            scroll: true,
                            drag: true,
                            sn: '1',
                            admin: true,
                            wpadmin: true,
                            ajax: "<?php echo admin_url('admin-ajax.php'); ?>",
                            url: "<?php echo self::getUrl(); ?>",
                            path: "<?php echo self::getPath(); ?>",
                            liburl: "<?php echo self::libUrl(); ?>",
                            libpath: "<?php echo self::libPath(); ?>",
                            nonce: "<?php echo wp_create_nonce('966916'); ?>",
                            title: 'IBS Mappro',
                            tag: '',
                            div: $('#ibs-div'),
                            maps: null,
                            debug: "<?php echo $debug; ?>"
                        })
            });</script>
        <?PHP
        $output = ob_get_contents();
        ob_end_clean();
        echo $output;
        exit;
    }

    static function cleanInt($int) {
        $int = str_replace('%', '', $int);
        return str_replace('px', '', $int);
    }

    static function handle_shortcode($atts, $content = null) {
        self::$add_script += 1;
        if(isset($atts['drag'])){
           $drag = $atts['drag'] === 'on' ? 'true' : 'false';
        }else{
            $drag = 'false';
        }
        if(isset($atts['maptype'])){
           $maptype = $atts['maptype'] === 'on' ? 'true' : 'false';
        }else{
            $maptype = 'false';
        }
          if(isset($atts['scroll'])){
           $scroll = $atts['scroll'] === 'on' ? 'true' : 'false';
        }else{
            $scroll = 'false';
        }
         if(isset($atts['streetview'])){
           $streetview = $atts['streetview'] === 'on' ? 'true' : 'false';
        }else{
            $streetview = 'false';
        }
         if(isset($atts['zoom'])){
           $zoom = $atts['zoom'] === 'on' ? 'true' : 'false';
        }else{
            $zoom = 'false';
        }
        
        $debug = isset(self::$options['debug']) && self::$options['debug'] === 'off' ? 'off' : 'on';
        $div = 'ibs-map-' . self::$add_script;
        $admin = isset($atts['admin']) && $atts['admin'] === 'on' ? 'true' : 'false';
        $controls = isset($atts['controls']) && $atts['controls'] === 'on' ? 'true' : 'false';
        $list = isset($atts['list']) && $atts['list'] === 'on' ? 'true' : 'false';
        $markermanager = isset($atts['markermanager']) && $atts['markermanager'] === 'on' ? 'true' : 'false';
        $search = isset($atts['search']) && $atts['search'] === 'on' ? 'true' : 'false';
        $elevation = isset($atts['elevation']) && $atts['elevation'] === 'on' ? 'true' : 'false';
        $title = isset($atts['title']) && $atts['title'] !== '' ? $atts['title'] : '';
        $tag = isset($atts['tag']) && $atts['tag'] !== '' ? $atts['tag'] : ' ';
        $maps = isset($atts['maps']) && $atts['maps'] ? $atts['maps'] : '';
        $width = isset($atts['width']) && $atts['width'] ? self::cleanInt($atts['width']) : '550';
        $height = isset($atts['height']) && $atts['height'] ? self::cleanInt($atts['height']) : '550';
        $width .= 'px';
        $height .= 'px';
        $align = isset($atts['align']) && $atts['align'] ? $atts['align'] : 'left';
        switch ($align) {
            case 'left' : $align = 'float:left; margin-right:10000px';
                break;
            case 'center' : $align = 'margin-left:auto; margin-right:auto;';
                break;
            case 'right' : $align = 'float:right; margin:left:10000px;';
                break;
            default:
                $align = 'margin-left:auto; margin-right:auto;';
        }

        ob_start();
        echo "<a class='ibs-img-loading' style='padding-left:20px;' href='#' id='$div-trigger' >$div</a><br/>";
        echo "<div class='google-map-div' id='$div' style='width:$width; height:$height; $align' ></div>";
        ?>
        <script type="text/javascript">
            jQuery(document).ready(function ($) {
                new IBS_MAPPRO(
                        {
                            drag: <?php echo $drag; ?>,
                            maptype: <?php echo $maptype; ?>,
                            scroll: <?php echo $scroll; ?>,
                            streetview: <?php echo $streetview; ?>,
                            zoom:<?php echo $zoom; ?>,
                            admin: <?php echo $admin; ?>,
                            controls: <?php echo $controls; ?>,
                            list:<?php echo $list; ?>,
                            markerManager:<?php echo $markermanager; ?>,
                            search:<?php echo $search ?>,
                            elevation:<?php echo $elevation ?>,
                            ajax: "<?php echo admin_url('admin-ajax.php'); ?>",
                            url: "<?php echo self::getUrl(); ?>",
                            path: "<?php echo self::getPath(); ?>",
                            liburl: "<?php echo self::libUrl(); ?>",
                            libpath: "<?php echo self::libPath(); ?>",
                            nonce: "<?php echo wp_create_nonce('966916'); ?>",
                            sn: "<?php echo self::$add_script; ?>",
                            title: "<?php echo $title; ?>",
                            tag: "<?php echo $tag; ?>",
                            div: $('#<?php echo $div; ?>'),
                            maps: "<?php echo $maps; ?>",
                            debug: "<?php echo $debug; ?>"
                        });
            });
        </script>

        <?PHP
        $output = ob_get_contents();
        ob_end_clean();
        return $output;
    }

    static function get_files($dir) {
        $result = array();
        if (file_exists($dir)) {
            $dir .= '/';
            $files = scandir($dir);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                foreach ($files as $file) {
                    if (file_exists($dir . $file)) {
                        if ($file != '.') {
                            if ($file != '..') {
                                if (false === is_dir($dir . $file)) {
                                    $result[] = htmlentities($file);
                                }
                            }
                        }
                    }
                }
            }
        }
        return $result;
    }

    static function get_dirs($dir) {
        $results = array();
        if (file_exists
                        ($dir)) {
            $dir .= '/';
            $files = scandir($dir);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                foreach ($files as $file) {
                    if (file_exists($dir . $file) && $file != '.' && $file != '..' && is_dir($dir . $file)) {
                        $results[] = htmlentities($file);
                    }
                }
            }
        }
        return $results;
    }

//ajax interface        

    static function savexml() {
        $data = $_REQUEST['data'];
        $message = 'Message: ';
        if ($data) {
            if (self::file_credentials()) {
                global $wp_filesystem;
                $data = urldecode($data);
                $data = stripslashes($data);
                $filename = $_REQUEST['filename'];
                $path = pathinfo($filename);
                $ext = $path['extension'];
                $dir = $path['dirname'];
                if (!is_dir($dir)) {
                    if (!wp_mkdir_p($dir)) {
                        echo "Failed to save map. Could not create folder.";
                        exit;
                    }
                }
                if ($ext == 'kmz') {
                    $zip = new ZipArchive();
                    if (file_exists($filename)) {
                        $zip->open($filename, ZIPARCHIVE::OVERWRITE);
                    } else {
                        $zip->open($filename, ZIPARCHIVE::CREATE);
                    }
                    $zip->addFromString($path['filename'] . '.maps', $data);
                    $zip->close();
                    echo urlencode($filename);
                    exit;
                } else {
                    $message . + ' file action.';
                    $r = @unlink($filename);
                    if ($wp_filesystem->put_contents($filename, $data, FS_CHMOD_FILE)) {
                        echo urlencode($filename);
                        exit;
                    }
                }
                echo 'Error writing file' . basename($filename);
                exit;
            }
            echo 'No file permissions';
            exit;
        } else {
            echo 'Missing data';
            exit;
        }
    }

    static function folders() {
        $type = $_REQUEST['type'];
        switch ($type) {
            case 'map' : $do_files = true;
                $allowed = array('kml', 'kmz', 'gpx');
                break;
            case 'dir' : $do_files = false;
                $allowed = array();
                break;
            case 'img' : $do_files = true;
                $allowed = array('png', 'jpeg', 'jpg', 'gif');
                break;
            case 'all' : $do_files = true;
                $allowed = array();
                break;
        }
        $dir = urldecode($_REQUEST['dir']);
        if (file_exists($dir)) {
            $files = scandir($dir);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                echo "<ul class=\"jqueryFileTree\" style=\"display: none;\">";
// All dirs
                foreach ($files as $file) {
                    if (file_exists($dir . $file) && $file != '.' && $file != '..' && is_dir($dir . $file)) {
                        echo "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($dir . $file) . "/\">" . htmlentities($file) . "</a></li>";
                    }
                }
// All files
                if ($do_files) {
                    foreach ($files as $file) {
                        if (file_exists($dir . $file) && $file != '.' && $file != '..' && !is_dir($dir . $file)) {
                            $ext = preg_replace('/^.*\./', '', $file);
                            $test = strtolower($ext);
                            if (count($allowed) == 0 || in_array($test, $allowed)) {
                                echo "<li class=\"file ext_$ext\"><a href=\"#\" rel=\"" . htmlentities($dir . $file) . "\">" . htmlentities($file) . "</a></li>";
                            }
                        }
                    }
                }
                echo "</ul>";
            }
        }
        exit;
    }

    static function copy() {
        $source = $_REQUEST['source'];
        $target = $_REQUEST['target'];
        global $wp_filesystem;
        if (self::file_credentials()) {
            if (!is_dir($source)) {
                $path = pathinfo($target);
                $dir = $path['dirname'];
                if (!is_dir($dir)) {
                    if (!wp_mkdir_p($dir)) {
                        echo "Failed to copy. Could not create folder.";
                        exit;
                    }
                }
                $wp_filesystem->copy($source, $target, true, FS_CHMOD_FILE);
            } else {
                wp_mkdir_p($target);
                $d = dir($source);
                $navFolders = array('.', '..');
                while (false !== ($fileEntry = $d->read() )) {//copy one by one
                    if (in_array($fileEntry, $navFolders)) {
                        continue;
                    }
                    $s = "$source/$fileEntry";
                    $t = "$target/$fileEntry";
                    self::copy($s, $t);
                }
                $d->close();
            }
            ob_end_clean();
            echo 'copy completed';
        } else {
            echo 'no file credentials';
        }
        exit;
    }

    static function rename() {
        $oldname = $_REQUEST['oldname'];
        $newname = $_REQUEST['newname'];
        if (@rename($oldname, $newname)) {
            echo 'rename completed ok';
        } else {
            echo 'error rename failed';
        }
        exit;
    }

    static function remove() {
        $type = $_REQUEST['type'];
        switch ($type) {
            case 'file' :
                $dir = $_REQUEST['filename'];
                if (file_exists($dir)) {
                    $r = @unlink($dir);
                    $mapid = str_replace('//', '/', $dir);
                    $path = pathinfo($dir);
                    $item = $path['filename'] . PHP_EOL;
                    echo sprintf('File: %s removed.', $item);
                } else {
                    echo sprintf('File: %s not found.', $dir);
                }
                break;
            case 'files' :
                $dir = $_REQUEST['dir'];
                $list = urldecode($_REQUEST['files']);
                $files = explode(';', $list);
                $result = '';
                foreach ($files as $file) { // iterate files
                    if (is_file($file)) {
                        $file = str_replace('//', '/', $file);
                        $path = pathinfo($file);
                        $item = $path['filename'] . PHP_EOL;
                        $result .= $item;
                        @unlink($file); // delete file
                    }
                }
                echo $result .= ' Files Removed';
                break;

            case 'directory':
                $dir = $_REQUEST['dir'];
                $it = new RecursiveDirectoryIterator($dir);
                $files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
                foreach ($files as $file) {
                    if ($file->getFilename() === '.' || $file->getFilename() === '..') {
                        continue;
                    }
                    if ($file->isDir()) {
                        rmdir($file->getRealPath());
                    } else {
                        unlink($file->getRealPath());
                    }
                }
                rmdir($dir);
                break;
        }
    }

    static function CORS() {
        $url = $_POST['path'];
        $info_url = parse_url($url);
        $info_path = pathinfo($info_url['path']);
        $ext = strtolower($info_path['extension']);
        $ch = curl_init();
        $service = str_replace(' ', '%20', $url);
        curl_setopt($ch, CURLOPT_URL, $service);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $data = curl_exec($ch);
        $headers = curl_getinfo($ch);
        curl_close($ch);
        if ($headers['http_code'] != '200') {
            echo "An error has occurred accessing this service";
            exit;
        } else {
            if ($ext == 'kmz') {
                if (self::file_credentials()) {
                    global $wp_filesystem;
                    $file = self::libPath() . 'work/zip.zip';
                    $r = @unlink($file);
                    if ($wp_filesystem->put_contents($file, $data, FS_CHMOD_FILE)) {
                        $archive = new PclZip($file);
                        $buf = $archive->extract(PCLZIP_OPT_EXTRACT_AS_STRING);
                        if ($buf == 0) {
                            echo 'failed to unzip kmz file.';
                            exit;
                        } else {
                            echo $buf[0]['content'];
                            exit;
                        }
                    } else {
                        echo 'failed to open kmz file.';
                        exit;
                    }
                } else {
                    echo 'No permission.';
                    exit;
                }
            } else {
                echo $data;
                exit;
            }
        }
    }

    static function dirs() {
        $dir = $_REQUEST['dir'];
        $results = array();
        if (file_exists($dir)) {
            $dir .= '/';
            $files = scandir($dir);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                foreach ($files as $file) {
                    if (file_exists($dir . $file) && $file != '.' && $file != '..' && is_dir($dir . $file)) {
                        $results[] = htmlentities($file);
                    }
                }
            }
        }
        echo json_encode($results);
        exit;
    }

    static function icons() {
        if ($_REQUEST['lib']) {
            $lib = $_REQUEST['lib'];
            $base = str_replace(self::libPath(), '', $lib);
            $result = array();
            $icons = self::get_files($lib);
            foreach ($icons as $icon) {
                $path_parts = pathinfo($icon);
                $dirname = $path_parts['dirname'];
                $basename = $path_parts['basename'];
                $extension = $path_parts['extension'];
                $filename = $path_parts['filename'];
                $url = self::libUrl() . $base . '/' . $basename;
                $result[] = array('name' => $filename, 'url' => $url);
            }
            echo json_encode($result);
        }
        exit;
    }

    static function download() {
        if (isset($_GET)) {
            $filename = $_GET['file'];
            $info = pathinfo($filename);
            $name = $info['basename'];
            if (file_exists($filename)) {
                header('Set-Cookie: fileDownload=true; path=/');
                header('Cache-Control: max-age=60, must-revalidate');
                header('Content-Disposition: attachment; filename="' . $title . '-' . $timestamp . '.csv"');
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . $name . '"');
                header('Content-Transfer-Encoding: binary');
                header('Expires: 0');
                header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
                header('Pragma: public');
                header('Content-Length: ' . filesize($filename));
                ob_clean();
                flush();
                readfile($filename);
                exit;
            } else {
                die;
            }
        } else {
            die;
        }
    }

    static function set_debug() {
        if (isset($_REQUEST['debug'])) {
            $debug = $_REQUEST['debug'];
            self::$options['debug'] = $debug;
            update_option('ibs_mappro_options', self::$options);
        }
        echo 'set debug completed.';
        exit;
    }

    static function set_track() {
        if (isset($_REQUEST['data'])) {
            $data = $_REQUEST['data'];
            $data = stripslashes($data);
            $data = json_decode($data);
            $options = array();
            foreach ($data as $i) {
                $id = $i->id;
                $options[$id]['where'] = $i->where;
                $options[$id]['msg'] = $i->msg;
                $options[$id]['date'] = date('D M j, Y - h:i a e');
            }
            update_option('ibs-where-is', $options);
        }
        echo 'set completed.';
        exit;
    }

    static function tracking() {
        $pids = get_option('ibs-where-is');
        echo json_encode($pids);
        exit;
    }

}

IBS_MAPPRO::init();
include( 'lib/widget-ibs-mappro.php' );
require_once(ABSPATH . 'wp-admin/includes/class-pclzip.php');

function ibs_handle_shortcode_spid($atts, $content = null) {
    $atts = shortcode_atts(array('id' => '', 'where' => '', 'msg' => '', 'date' => ''), $atts, 'ibs-track');
    $options = get_option('ibs-where-is');
    $id = ucfirst(trim(str_replace('"', '', $atts['id'])));
    $where = trim(str_replace('"', '', $atts['where']));
    $msg = trim(str_replace('"', '', $atts['msg']));
    if ($id !== '' && $where !== '') {
        $options = get_option('ibs-where-is');
        if (isset($options[$id])) {
            $options[$id]['where'] = $where;
            $options[$id]['msg'] = $msg;
            $options[$id]['date'] = date('D M j, Y - h:i a e');
            update_option('ibs-where-is', $options);
        }
    }
}

add_action('save_post', 'ibs_process_shortcode', 13, 2);

function ibs_process_shortcode($post_id) {
    global $shortcode_tags;
    $post = get_post($post_id);
    if (strpos($post->post_content, '[ibs-track') !== FALSE) {
        $save_shortcode_tags = $shortcode_tags;
        remove_all_shortcodes();
        add_shortcode('ibs-track', 'ibs_handle_shortcode_spid');
        $post->post_content = do_shortcode($post->post_content);
        remove_shortcode('ibs-track');
        $shortcode_tags = $save_shortcode_tags;
        remove_action('save_post', 'ibs_process_shortcode', 13, 2);
        wp_update_post(array('ID' => $post_id, 'post_content' => $post->post_content));
        $post = get_post($post_id);
        add_action('save_post', 'ibs_process_shortcode', 13, 2);
    }
}
