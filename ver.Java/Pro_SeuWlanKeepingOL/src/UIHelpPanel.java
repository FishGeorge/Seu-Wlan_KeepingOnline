import javax.swing.*;
import java.awt.*;

public class UIHelpPanel extends JPanel {
    private JLabel label_help = new JLabel("Help");

    public UIHelpPanel() {
        setLayout(new GridBagLayout());
        add(label_help);
    }
}
