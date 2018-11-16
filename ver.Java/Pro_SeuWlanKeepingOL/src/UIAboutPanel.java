import javax.swing.*;
import java.awt.*;

public class UIAboutPanel extends JPanel {
    private JLabel label_auther = new JLabel("作者：龚呈  ");
    private JLabel label_git = new JLabel("Git@FishGeorge");
    private JLabel label_email = new JLabel("E-mail：372804891@qq.com");

    public UIAboutPanel() {
        setLayout(new FlowLayout());
        add(label_auther);
        add(label_git);
        add(label_email);
    }
}
