import javax.swing.*;
import java.awt.*;

public class UIAboutPanel extends JPanel {
    private JLabel label_about = new JLabel("About");

    public UIAboutPanel() {
        setLayout(new GridBagLayout());
        add(label_about);
    }
}
