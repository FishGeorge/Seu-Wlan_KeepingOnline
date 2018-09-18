import java.awt.*;
import javax.swing.*;
import java.awt.event.*;

public class UIMainPanel extends JPanel {
    private JLabel label_user = new JLabel("一卡通号");
    private JLabel label_psw = new JLabel("密码");
    private JLabel label_start = new JLabel("开机启动");
    private JLabel label_rempsw = new JLabel("自动登录");
    private JLabel label_log = new JLabel("记录：");
    private JTextField txt_username = new JTextField();
    private JTextField txt_psw = new JTextField();
    private JButton btn_login = new JButton("登录");
    private JButton btn_logout = new JButton("注销");
    private JCheckBox cb_start = new JCheckBox();
    private JCheckBox cb_rempsw = new JCheckBox();
    private JTextArea txtA_log = new JTextArea();

    public UIMainPanel() {
        // 对Panel进行布局
        // 设置默认宽度和高度
//        setPreferredSize(new Dimension(300, 400));
        // 布局设置为null布局
        setLayout(null);

        // 依次设置组件大小，将所有组件加入Panel对象中去
        label_user.setBounds(5,10,75,20);
        add(label_user);
        txt_username.setBounds(80,10,160,20);
        add(txt_username);
        label_psw.setBounds(5,30,75,20);
        add(label_psw);
        txt_psw.setBounds(80,30,160,20);
        add(txt_psw);
        btn_login.setBounds(0,50,120,20);
        add(btn_login);
        btn_logout.setBounds(120,50,120,20);
        add(btn_logout);
        cb_start.setBounds(0,70,20,20);
        add(cb_start);
        label_start.setBounds(20,70,80,20);
        add(label_start);
        cb_rempsw.setBounds(120,70,20,20);
        add(cb_rempsw);
        label_rempsw.setBounds(140,70,80,20);
        add(label_rempsw);
        label_log.setBounds(5,90,240,20);
        add(label_log);
        txtA_log.setBounds(0,110,240,100);
        add(txtA_log);
    }
}
