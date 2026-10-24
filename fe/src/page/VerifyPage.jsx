import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Field from "../components/field/Field";
import Input from "../components/input/Input";
import Label from "../components/label/Label";
import AuthenticationPage from "./AuthenticationPage";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "../components/button/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { changeState, verify } from "../redux/auth/userSlice";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";

const schema = yup.object({
  verify: yup
    .string()
    .required("Vui lòng nhập mã xác nhận")
    .min(6, "Mã xác nhận tối thiểu 6 ký tự"),
});

const VerifyPage = () => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: { verify: "" },
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dem = useRef(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("jwt");
    if (!user || !token) return navigate("/sign-up");
    if (user.active === "active") {
      toast.dismiss();
      toast.success("Chào mừng bạn đến với Vũ Hoàng Shop", {
        pauseOnHover: false,
      });
      navigate("/");
    }
  }, [navigate]);

  const handleVerify = async (values) => {
    if (!isValid) return;
    const data = { encode: values.verify };
    try {
      const result = await dispatch(verify(data));
      unwrapResult(result);
      toast.success("Xác thực thành công! 🎉", { pauseOnHover: false });
      navigate("/");
      reset();
    } catch (error) {
      dem.current++;
      if (dem.current >= 3) {
        await dispatch(changeState({ state: "ban" }));
        toast.warning("Sai mã 3 lần. Tài khoản bị khóa!", {
          pauseOnHover: false,
        });
        navigate("/sign-up");
        dem.current = 0;
      } else {
        toast.error(error.message || "Mã xác nhận không đúng!", {
          pauseOnHover: false,
        });
      }
    }
  };

  return (
    <AuthenticationPage>
      <div className="flex items-center justify-center px-10 py-8 bg-white/60 rounded-2xl shadow-lg backdrop-blur">
        <div className="w-full max-w-[400px]">
          <h2 className="text-3xl font-bold text-green-600 text-center mb-3">
            Xác thực tài khoản
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Nhập mã xác nhận được gửi đến email của bạn
          </p>

          <form
            onSubmit={handleSubmit(handleVerify)}
            autoComplete="off"
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-full max-w-[300px] text-center">
              <Label
                htmlFor="verify"
                className="text-gray-700 font-semibold block mb-2 text-lg"
              >
                Mã xác nhận
              </Label>
              <Input
                name="verify"
                type="text"
                placeholder="Nhập mã xác nhận"
                control={control}
                className="w-full text-center text-lg tracking-widest font-medium h-[50px] rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              {errors.verify && (
                <p className="text-red-500 text-sm font-medium mt-2">
                  {errors.verify?.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              disable={isSubmitting}
              className="w-[200px] h-[50px] bg-gradient-to-r from-green-500 to-lime-500 hover:opacity-90 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Xác nhận
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Chưa nhận được mã?{" "}
              <span className="text-green-600 font-semibold cursor-pointer hover:underline">
                Gửi lại mã
              </span>
            </p>
          </div>
        </div>
      </div>
    </AuthenticationPage>
  );
};

export default VerifyPage;
