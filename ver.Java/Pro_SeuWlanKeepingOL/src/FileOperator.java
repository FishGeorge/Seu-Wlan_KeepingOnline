import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;

public class FileOperator {
    private File file;
    private FileReader reader;
    private FileWriter writer;

    public FileOperator(String FileName) {
        file = new File(FileName);
    }

    public void write(String content) {
        try {
            writer = new FileWriter(file);
            writer.write(content);
            writer.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String read() {
        try {
            reader = new FileReader(file);
            char byt[] = new char[10240];
            int len = reader.read(byt);
            reader.close();
            return new String(byt, 0, len);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}
