import { Toaster, toast } from "react-hot-toast";

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "18px",
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.14)",
          padding: "14px 16px",
          fontSize: "14px",
          maxWidth: "420px",
        },
        success: {
          iconTheme: {
            primary: "#E84322",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}

export { AppToaster, toast };
