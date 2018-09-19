import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;

public class SEUkeepingOnline {
    private String Username = "";
    private String Password = "";
    private String Password_base64 = "";
    private Base64 base64 = new Base64();

    protected String BingURL = "https://cn.bing.com/";
    private String SeuURL = "http://w.seu.edu.cn/";
    private String SeuLoginURL = "http://w.seu.edu.cn/index.php/index/login";
    private String cookie = "";

    private boolean isLogined = false;
    private String version = "1.0.0";

    private HttpURLConnection conn = null;
    private OutputStream os = null;
    private InputStream is = null;

    private SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public SEUkeepingOnline() {

    }

    public SEUkeepingOnline(String username, String password) {
        Username = username;
        Password = password;
        Password_base64 = base64.Base64Encrypt(Password);
    }

    /*
     * 用于测试某个URL连接正常
     * param: String
     * return: boolean
     *
     */
    public boolean URL_ConnectiveCheck(String URL) {
        int timeOut = 1000;
        boolean status = false;
        HttpURLConnection con = null;
        // 尝试最多5次以确定是否连接
        for (int i = 5; i > 0; i--) {
            try {
                URL url = new URL(URL);
                con = (HttpURLConnection) url.openConnection();
                con.setRequestMethod("GET");
                con.setConnectTimeout(timeOut);
                con.connect();

                int code = con.getResponseCode();
                if (code == 200) {
                    status = true;
                    break;
                }
                Thread.sleep(500);
            } catch (Exception e) {
                status = false;
            } finally {
                if (con != null) {
                    con.disconnect();
                }
            }
        }
        return status;
    }

    /*
     * 用于得到seu.edu.cn适用于本机的cookie
     * param: null
     * return: null
     *
     */
    public void GetCookie() {
        System.out.println(df.format(new Date()) + " Geting cookie...");
        try {
            URL url = new URL(SeuURL);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            cookie = conn.getHeaderField("Set-Cookie");
            System.out.println(df.format(new Date()) + " ...Done!");
            System.out.println(df.format(new Date()) + " Set-Cookie: " + cookie);
            cookie = cookie + "; think_language=zh-Hans-CN" + "; sunriseUsername=" + Username;
            System.out.println(df.format(new Date()) + " Modified cookie: " + cookie);
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    /*
     * 登录
     * param: null
     * return: int
     *           0: 登陆成功
     *           -1: 因某种原因登录失败
     *           -2: 未连接上seu.edu.cn
     *
     */
    public int Login() {
        System.out.println(df.format(new Date()) + " Try to login...");
        // 检测w.seu.edu.cn连接情况
        if (!URL_ConnectiveCheck(SeuURL)) {
            System.out.println(df.format(new Date()) + " Connecting to w.seu.edu.cn Failed");
            return -2;
        } else {
            System.out.println(df.format(new Date()) + " Connecting to w.seu.edu.cn Successfully");

            // 获取cookie
            GetCookie();
            try {
                URL url = new URL(SeuLoginURL);
                conn = (HttpURLConnection) url.openConnection();
                // 命令类型 POST
                conn.setRequestMethod("POST");
                // 添加POST Header
                conn.setRequestProperty("Accept", "application/json, text/javascript, */*; q=0.01");
                conn.setRequestProperty("Accept-Encoding", "gzip, deflate");
                conn.setRequestProperty("Accept-Language", "zh-Hans-CN, zh-Hans; q=0.8, en-US; q=0.5, en; q=0.3");
                conn.setRequestProperty("Connection", "Keep-Alive");
                conn.setRequestProperty("Content-Length", "64");
                conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                conn.setRequestProperty("DNT", "1");
                conn.setRequestProperty("Host", "w.seu.edu.cn");
                conn.setRequestProperty("Origin", "http://w.seu.edu.cn/");
                conn.setRequestProperty("Referer", "http://w.seu.edu.cn/");
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko Core/1.63.5478.400 QQBrowser/10.1.1550.400");
                conn.setRequestProperty("X-Requested-With", "XMLHttpRequest");
                // 添加cookie
                conn.setRequestProperty("cookie", cookie);
                // 使能IO
                conn.setDoInput(true);
                conn.setDoOutput(true);
                // 发送登录命令
                String Request =
                        "username=" + Username +
                                "&password=" + Password_base64 +
                                "&enablemacauth=0";
                os = conn.getOutputStream();
                os.write(Request.getBytes());
                // 登录成功判断
                is = conn.getInputStream();
                String response = "";
                byte[] b = new byte[1024];
                int len = is.read(b);
                while (len != -1) {
                    response += new String(b, 0, len, "utf-8");
                    len = is.read(b);
                }
//            System.out.println(response);
                if (response.contains("\\u8ba4\\u8bc1\\u6210\\u529f")) {
                    isLogined = true;
                    return 0;
                }
                if (response.contains("\\u8ba4\\u8bc1\\u5931\\u8d25\\uff0c\\u8d26\\u6237\\u6d41\\u91cf\\u8d85\\u914d\\u989d\\u9501\\u5b9a")) {
                    isLogined = false;
                    return -1;
                }
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } finally {
                try {
                    if (is != null) {
                        is.close();
                    }
                    if (os != null) {
                        os.close();
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
                if (conn != null) {
                    conn.disconnect();
                }
            }
            return -1;
        }
    }

    /*
     * 用于测试某个URL连接正常
     * param: int
     *          连接成功后的检查网络周期
     * return: null
     *
     */
    public void Run(int seconds) {
        int interval = seconds;
        while (true) {
            if (!URL_ConnectiveCheck(BingURL)) {
                System.out.println(df.format(new Date()) + " Internet Connecting Failed !");
                switch (Login()) {
                    case 0:
                        System.out.println(df.format(new Date()) + " ...Login Successfully ");
                        if (URL_ConnectiveCheck(BingURL)) {
                            System.out.println(df.format(new Date()) + " Now online!");
                            interval = seconds;
                        }
                        break;
                    case -1:
                        System.out.println(df.format(new Date()) + " ...Login Failed ! Incorrect Username or Password ");
                        interval = 120;
                        break;
                    case -2:
                        System.out.println(df.format(new Date()) + " ...Login Failed ! Can not connect to http://w.seu.edu.cn/ ");
                        interval = 120;
                        break;
                    default:
                }
            } else System.out.println(df.format(new Date()) + " still keep online");
            // 每隔interval秒检查一次网络状况
            try {
                Thread.sleep(interval * 1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public boolean getisLogined() {
        return isLogined;
    }

    public String getVersion() {
        return version;
    }

    // 测试用例
    public static void main(String[] args) {
        SEUkeepingOnline instance = new SEUkeepingOnline("213161568", "Orange0910");
        instance.Run(15);
    }
}
