// Bagian Google Identity Services (https://accounts.google.com/gsi/client) yang dipakai tombol
// Masuk dengan Google di /mudarris/login. Library ini tidak punya paket tipe resmi.

type ResponsKredensialGoogle = {
  /** ID token (JWT) yang diteruskan ke backend sebagai `credential`. */
  credential: string;
};

type KonfigurasiIdGoogle = {
  client_id: string;
  callback: (respons: ResponsKredensialGoogle) => void;
  ux_mode?: "popup" | "redirect";
  context?: "signin" | "signup" | "use";
};

type OpsiTombolGoogle = {
  type: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  /** Piksel, 200–400. */
  width?: number;
  locale?: string;
  click_listener?: () => void;
};

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (konfigurasi: KonfigurasiIdGoogle) => void;
        renderButton: (induk: HTMLElement, opsi: OpsiTombolGoogle) => void;
      };
    };
  };
}
