// Ada di grup (halaman), bukan langsung di /mudarris: halaman di bawah loading
// boundary mulai di-stream sebagai 200, jadi [...lainnya] harus di luarnya
// supaya alamat yang tidak dikenal mendapat status 404 sungguhan.
export { default } from "@/app/dashboard/loading";
