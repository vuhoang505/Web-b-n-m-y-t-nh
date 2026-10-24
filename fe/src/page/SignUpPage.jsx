import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "../components/button/Button";
import Checkbox from "../components/checkbox/Checkbox";
import Field from "../components/field/Field";
import Input from "../components/input/Input";
import InputPasswordToggle from "../components/input/InputPasswordToggle";
import Label from "../components/label/Label";
import AuthenticationPage from "./AuthenticationPage";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { register } from "../redux/auth/userSlice";
import { unwrapResult } from "@reduxjs/toolkit";

const schema = yup.object({
  fullname: yup
    .string()
    .required("Vui lòng nhập họ tên")
    .min(3, "Tối thiểu phải có 3 ký tự")
    .max(30, "Vượt quá 30 ký tự cho phép"),
  email: yup
    .string()
    .email("Vui lòng nhập đúng định dạng email")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Tối thiểu 8 ký tự")
    .max(30, "Vượt quá 30 ký tự cho phép")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message: "Bắt buộc phải có chữ hoa, chữ thường, ký tự đặc biệt, số",
      }
    ),
  retypePassword: yup
    .string()
    .required("Vui lòng nhập lại mật khẩu")
    .oneOf([yup.ref("password")], "Xác nhận mật khẩu chưa đúng"),
  term: yup.boolean().oneOf([true], "Vui lòng chấp nhận điều khoản"),
});

const SignUpPage = () => {
  const {
    handleSubmit,
    control,
    formState: { isValid, errors, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      retypePassword: "",
      term: false,
    },
  });
  
  const [avatarUrl, setAvatarUrl] = useState(""); // 🟢 thêm state lưu avatar
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (
      localStorage.getItem("jwt") &&
      JSON.parse(localStorage.getItem("user")).active === "verify"
    ) {
      toast.dismiss();
      toast.warning("Vui lòng xác thực tài khoản", { pauseOnHover: false });
      return navigate("/verify");
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/png") {
        toast.error("Chỉ được chọn ảnh PNG!", { pauseOnHover: false });
        return;
      }
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
    }
  };


  const handleSignUp = async (values) => {
    if (!isValid) return;
    try {
      // nếu người dùng có chọn ảnh, upload trước rồi lấy URL
      let finalAvatar = "";
      if (avatarUrl) {
        finalAvatar = avatarUrl; // URL thật (ví dụ từ imgbb)
      
      }
      const data = {
        name: values.fullname,
        email: values.email,
        password: values.password,
        passwordConfirm: values.retypePassword,
        avatar: avatarUrl || "be/public/images/anh.png", // 🟢 nếu không chọn ảnh => mặc định anh.png
      };
      const action = register(data);
      const resultAction = await dispatch(action);
      const user = unwrapResult(resultAction);
      console.log(user);
      toast.dismiss();
      toast.success("Đăng ký tài khoản thành công", { pauseOnHover: false });
      reset({
        fullname: "",
        email: "",
        password: "",
        retypePassword: "",
        term: false,
      });
      setAvatarUrl("");
      navigate("/verify");
    } catch (error) {
      toast.dismiss();
      toast.error(error.message, { pauseOnHover: false });
    }
  };

  return (
  <AuthenticationPage>
    <form
      autoComplete="off"
      onSubmit={handleSubmit(handleSignUp)}
      className="space-y-6 max-w-md mx-auto w-full"
    >
      <div className="flex flex-col items-center mb-4">
  <img
    src="/images/logo.png"   // 👉 hoặc dùng {logo} nếu bạn import
    alt="Logo"
    className="w-20 h-20 object-contain mb-2"
  />
  <h2 className="text-2xl font-bold text-center text-gray-800">
    Tạo tài khoản mới
  </h2>
</div>


      <div className="space-y-4">
        {/* Họ tên */}
        <div>
          <Label htmlFor="fullname" className="text-gray-700 font-semibold">
            Họ và tên
          </Label>
          <Input
            type="text"
            name="fullname"
            placeholder="Nhập họ tên của bạn"
            control={control}
          />
          {errors.fullname && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fullname?.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-gray-700 font-semibold">
            Email
          </Label>
          <Input
            type="email"
            name="email"
            placeholder="Nhập email của bạn"
            control={control}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email?.message}
            </p>
          )}
        </div>

        {/* Mật khẩu */}
        <div>
          <Label htmlFor="password" className="text-gray-700 font-semibold">
            Mật khẩu
          </Label>
          <InputPasswordToggle control={control} name="password" />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password?.message}
            </p>
          )}
        </div>

        {/* Nhập lại mật khẩu */}
        <div>
          <Label htmlFor="retypePassword" className="text-gray-700 font-semibold">
            Nhập lại mật khẩu
          </Label>
          <InputPasswordToggle control={control} name="retypePassword" />
          {errors.retypePassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.retypePassword?.message}
            </p>
          )}
        </div>

       {/* Nút tải ảnh đại diện (chỉ cho phép file PNG) */}
<div>
  <Label htmlFor="avatar" className="text-gray-700 font-semibold">
    Ảnh đại diện (chỉ nhận file PNG)
  </Label>
  <input
    type="file"
    id="avatar"
    name="avatar"
    accept=".png"
    onChange={handleAvatarChange}
    className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none
    file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold
    file:bg-[#1DC071] file:text-white hover:file:opacity-90 transition"
  />
</div>

        {/* Điều khoản */}
        <div className="mt-2">
          <Checkbox
            control={control}
            text="Tôi đồng ý với các điều khoản và chính sách"
            name="term"
          />
          {errors.term && (
            <p className="text-red-500 text-sm mt-1">{errors.term?.message}</p>
          )}
        </div>
      </div>

      {/* Nút đăng ký */}
      <Button
        type="submit"
        isLoading={isSubmitting}
        disable={isSubmitting}
        className="w-full bg-gradient-to-r from-[#1DC071] to-[#00AEEF] text-white font-semibold rounded-xl py-3 text-lg mt-6 hover:opacity-90 transition"
      >
        Đăng ký
      </Button>

      {/* Link chuyển qua đăng nhập */}
      <div className="flex items-center justify-center text-sm mt-4">
        <span className="text-gray-600">Bạn đã có tài khoản? </span>
        <Link
          to="/sign-in"
          className="ml-1 text-[#1DC071] font-semibold hover:underline"
        >
          Đăng nhập
        </Link>
      </div>
    </form>
  </AuthenticationPage>
  );
};

export default SignUpPage;
