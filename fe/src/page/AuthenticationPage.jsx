import React from "react";
import { Link } from "react-router-dom";

const AuthenticationPage = ({ children }) => {
  return (
    <div
      className="w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/truong.png')" }} // ảnh nền tùy bạn
    >
      <div className="max-w-[1000px] w-full mx-auto bg-white/90 rounded-2xl shadow-lg grid grid-cols-2 overflow-hidden">
        {/* Cột trái */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-cyan-500 p-10 text-white">
          <Link to="/" className="mb-6">
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-[150px] h-[150px] object-contain mx-auto"
            />
          </Link>
          <h2 className="text-3xl font-bold mb-3">Welcome to Vũ Hoàng Shop</h2>
          <p className="text-lg font-medium opacity-90">
            Uy tín - Chất lượng - Tận tâm
          </p>
        </div>

        {/* Cột phải */}
        <div className="flex flex-col justify-center bg-white p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
