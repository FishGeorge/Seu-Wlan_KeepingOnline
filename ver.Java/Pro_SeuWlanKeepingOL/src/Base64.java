import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import java.io.IOException;

public class Base64 {
    // 加密到base64（%3D填充空格）
    public String Base64Encrypt(String src) {
        String out = new BASE64Encoder().encode(src.getBytes());
        out = out.replace("=", "%3D");
        return out;
    }

    // 从base64解密
    public String Base64Decrypt(String src) {
        String str =src;
        str = str.replace("%3D", "=");
        try {
            return new String(new BASE64Decoder().decodeBuffer(str));
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static void main(String[] args) {
        String str = "TestPassword";
        String str_base64en = new Base64().Base64Encrypt(str);
        String str_base64de = new Base64().Base64Decrypt(str_base64en);
        System.out.println("明文: " + str);
        System.out.println("Base64加密处理后: " + str_base64en);
        System.out.println("Base64解密处理后: " + str_base64de);
    }
}
