import javax.swing.*;
import java.awt.event.*;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;

public class UIMainPanel extends JPanel {
    private JLabel label_user = new JLabel("一卡通号:");
    private JLabel label_psw = new JLabel("密码:");
    private JLabel label_start = new JLabel("开机启动");
    private JLabel label_rempsw = new JLabel("自动登录");
    private JLabel label_log = new JLabel("记录:");
    private JLabel label_version = new JLabel();
    private JTextField txt_username = new JTextField();
    private JPasswordField txt_psw = new JPasswordField();
    private JButton btn_login = new JButton("登  录");
    private JButton btn_logout = new JButton("注  销");
    private JCheckBox cb_showPsw = new JCheckBox("", false);
    private JCheckBox cb_PB = new JCheckBox("", false);
    private JCheckBox cb_AL = new JCheckBox("", false);
    private JTextArea txtA_log = new JTextArea();
    private JScrollPane sp_log = new JScrollPane(txtA_log);
    private JScrollBar spBar = sp_log.getVerticalScrollBar();

    private SEUkeepingOnline keeper = new SEUkeepingOnline();

    private String ui_username = "";
    private String ui_psw = "";
    private boolean isPswShowing_cb = false;
    private boolean isRunning = false;
    private boolean isLogined = false;
    private boolean isPowerBoot_cb = false;
    private boolean isAutoLogin_cb = false;

    private Thread keeper_t;

    private SimpleDateFormat df = new SimpleDateFormat("MM-dd HH:mm:ss");

    public UIMainPanel() {
        // 对Panel进行布局
        // 设置默认宽度和高度
//        setPreferredSize(new Dimension(300, 400));
        // 布局设置为null布局
        setLayout(null);

        // 获取版本号
        label_version.setText("Ver: " + keeper.getVersion());

        // 为textfield设置监听
        txt_username.addFocusListener(new FocusListener() {
            @Override
            public void focusGained(FocusEvent e) {
            }

            @Override
            public void focusLost(FocusEvent e) {
                // 失去焦点时将文本刷新到变量中
                ui_username = txt_username.getText();
            }
        });
        txt_psw.addFocusListener(new FocusListener() {
            @Override
            public void focusGained(FocusEvent e) {
            }

            @Override
            public void focusLost(FocusEvent e) {
                // 失去焦点时将文本刷新到变量中
                ui_psw = new String(txt_psw.getPassword());
//                System.out.println(ui_psw);
            }
        });
        // 设置屏蔽字符
        txt_psw.setEchoChar('*');
        // 设置不可获得焦点
        txtA_log.setFocusable(false);

        // 为btn设置监听
        btn_login.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
//                System.out.println(ui_username);
                if (!isRunning) {
                    if (isNumeric(ui_username) && !ui_username.equals("")) {
                        int len = ui_username.length();
                        if (len == 9) {
                            if (!ui_psw.equals("")) {
                                printToUI(false, "START\n");
                                login();
                                refresh_isLogined();
                            } else {
                                // 提示未输入密码
                                printToUI(false, "未输入密码\n");
                            }
                        } else {
                            // 提示一卡通号不符合格式2
                            printToUI(false, "一卡通号长度错误\n");
                        }
                    } else {
                        // 提示一卡通号不符合格式1
                        printToUI(false, "一卡通号不符合格式\n");
                    }
                } else {
                    // 提示登录机正在运行
                    printToUI(false, "保持器已经在工作啦\n");
                }
            }
        });
        btn_logout.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (isRunning) {
                    if (isLogined) {
                        // 注销seu登录

                    }
                    // 停止登录器运行

                } else {
                    // 提示登录器未运行
                    printToUI(false, "保持器不在工作中哦\n");
                }
            }
        });

        // 为checkbox设置监听
        cb_showPsw.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                isPswShowing_cb = !isPswShowing_cb;
                if (isPswShowing_cb) {
                    txt_psw.setEchoChar((char) 0);
                } else {
                    txt_psw.setEchoChar('*');
                }
            }
        });
        cb_PB.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                isPowerBoot_cb = !isPowerBoot_cb;
            }
        });
        cb_AL.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                isAutoLogin_cb = !isAutoLogin_cb;
            }
        });

        // 设置scrollpane
        sp_log.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        sp_log.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);

        // 依次设置组件位置大小，将所有组件加入Panel对象中去
        label_user.setBounds(5, 10, 61, 30);
        add(label_user);
        txt_username.setBounds(66, 10, 190, 30);
        add(txt_username);
        label_psw.setBounds(5, 40, 61, 30);
        add(label_psw);
        txt_psw.setBounds(66, 40, 168, 30);
        add(txt_psw);
        cb_showPsw.setBounds(234, 40, 30, 30);
        add(cb_showPsw);
        btn_login.setBounds(0, 75, 129, 30);
        add(btn_login);
        btn_logout.setBounds(129, 75, 129, 30);
        add(btn_logout);
        cb_PB.setBounds(5, 105, 25, 30);
        add(cb_PB);
        label_start.setBounds(45, 105, 84, 30);
        add(label_start);
        cb_AL.setBounds(134, 105, 25, 30);
        add(cb_AL);
        label_rempsw.setBounds(174, 105, 84, 30);
        add(label_rempsw);
        label_log.setBounds(5, 125, 195, 30);
        add(label_log);
        label_version.setBounds(200, 125, 58, 30);
        add(label_version);
        sp_log.setBounds(0, 155, 258, 140);
        add(sp_log);
    }

    public void login(){
        // 新线程1进行登录尝试
        keeper_t = new Thread(new Runnable() {
            @Override
            public void run() {
                keeper = new SEUkeepingOnline(ui_username, ui_psw);
                int interval = 5;
                while (true) {
                    if (!keeper.URL_ConnectiveCheck(keeper.BingURL)) {
                        printToUI(true, " Internet Connecting Failed !\n");
                        switch (keeper.Login()) {
                            case 0:
                                printToUI(true, " ...Login Successfully\n");
                                if (keeper.URL_ConnectiveCheck(keeper.BingURL)) {
                                    printToUI(true, " Now online!\n");
                                    interval = 5;
                                }
                                break;
                            case -1:
                                printToUI(true, " ...Login Failed ! Incorrect Username or Password\n");
                                interval = 120;
                                break;
                            case -2:
                                printToUI(true, " ...Login Failed ! Can not connect to http://w.seu.edu.cn/\n");
                                interval = 120;
                                break;
                            default:
                        }
                    } else printToUI(true, " still keep online\n");
                    // 每隔interval秒检查一次网络状况
                    try {
                        Thread.sleep(interval * 1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
        keeper_t.start();
    }

    public void refresh_isLogined(){
        // 新线程2刷新UI登录状态
        new Thread(new Runnable() {
            @Override
            public void run() {
                while (true) {
                    isLogined = keeper.getisLogined();
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e1) {
                        e1.printStackTrace();
                    }
                }
            }
        }).start();
    }

    public boolean isNumeric(String str) {
        for (int i = 0; i < str.length(); i++)
            if (!Character.isDigit(str.charAt(i)))
                return false;
        return true;
    }

    public void printToUI(boolean type, String str) {
        if (type)
            txtA_log.append(df.format(new Date()) + str);
        else
            txtA_log.append(str);
        spBar.setValue(spBar.getMaximum());
    }
}

class Thread_IOfile extends Thread {
    public void run() {

    }
}