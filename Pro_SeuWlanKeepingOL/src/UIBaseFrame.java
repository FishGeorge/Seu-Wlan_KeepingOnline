import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.*;

public class UIBaseFrame extends JFrame{
    private JTabbedPane TabbedPane;

    public UIBaseFrame() {
        // 设置默认宽度和高度
        setSize(250, 400);
        // 设置打开程序时的显示位置
        setLocation(500,150);
        // 设置窗口不可改变大小
        setResizable(false);
        // 将类的实例域中的面板对象实例化
        TabbedPane = new JTabbedPane();

        TabbedPane.addTab("主页面",new UIMainPanel());
        TabbedPane.addTab("关于",new UIAboutPanel());
//        TabbedPane.setBackground(new Color(208, 208, 208));

        // 将面板设置为Frame面板中
        setContentPane(TabbedPane);
    }

    public static void main(String[] args) {
        // 开启一个线程，所有的Swing组件必须由事件分派线程进行配置，线程将鼠标点击和按键控制转移到用户接口组件。
        EventQueue.invokeLater(new Runnable() {
            // 匿名内部类，是一个Runnable接口的实例，实现了run方法
            public void run() {
                JFrame frame = new UIBaseFrame();
                // 将窗口最大化
//                frame.setExtendedState(Frame.MAXIMIZED_BOTH);
                // 设置窗口标题
                frame.setTitle("Christmas");
                // 选择当用户关闭框架的时候进行的操作，在有些时候需要将窗口隐藏，不能直接退出需要用到这个方法
                frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                // 将窗口可见化，这样以便用户在第一次看见窗口之前我们能够向其中添加内容
                frame.setVisible(true);
            }
        });
    }
}