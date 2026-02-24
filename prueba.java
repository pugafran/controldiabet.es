import java.util.Scanner;

public class prueba {

    public static void main(String[] args) {

        String Manolo;
        int edad;
        double edad2;

        // char String
        // Int double float

        Manolo = "Manolo";
        edad = (int) 33.3;

        boolean guapo;

        System.out.println("Dime algo: ");
        Scanner lector = new Scanner(System.in);

        String resultado_terminal = lector.nextLine();

        System.out.println(resultado_terminal);

        guapo = true;

        if (guapo) {
            System.out.print("Que guapo soy");
        }

    }

}