static X: i32 = 10; // x tiene un alcance global en este caso

fn main() {
    let y = 5; // y tiene un alcance local a la función main
    println!("x: {} y: {}", X, y);

    existe(X);
    existe(y);
    pintaY();
} // y sale de alcance aquí y se descarta


// x sigue estando en alcance aquí


fn existe(numerito: i32){
    println!("Número: {}", numerito);
    pintaY();
}

fn pintaY(){
    println!("Y: {}", y);
}