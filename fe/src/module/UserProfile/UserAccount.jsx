import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import DashboardHeading from "../dashboard/DashboardHeding";
import Button from "../../components/button/Button";
import Field from "../../components/field/Field";
import Label from "../../components/label/Label";
import Input from "../../components/input/Input";
import { useForm } from "react-hook-form";
import FieldCheckboxes from "../../components/field/FieldCheckboxes";
import Radio from "../../components/checkbox/Radio";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment-timezone";
import ImageUpload from "../../components/images/ImageUpload";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getUser, refresh, updateInfoUser } from "../../redux/auth/userSlice";
import { action_status } from "../../utils/constants/status";
import Skeleton from "../../components/skeleton/Skeleton";
import { useNavigate } from "react-router-dom";

const today = moment();
const schema = yup.object({
  fullname: yup
    .string()
    .required("Vui lòng nhập họ tên")
    .min(3, "Tối thiểu phải có 3 ký tự")
    .max(30, "Vượt quá 30 ký tự cho phép"),
  sdt: yup
    .string()
    .required("Vui lòng nhập số điện thoại")
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, {
      message: "Định dạng số điện thoại không đúng",
    }),
  dateOfBirth: yup
    .string()
    .required("Vui lòng chọn ngày sinh")
    .nullable()
    .max(today, "Ngày sinh không hợp lệ"),
  gender: yup.string().oneOf(["nam", "nữ", "khác"], "Vui lòng chọn giới tính"),
});

const Gender = {
  NAM: "nam",
  NU: "nữ",
  Diff: "khác",
};

const UserAccount = () => {
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    getValues,
    reset,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, update, status, current } = useSelector((state) => state.user);
  const watchGender = watch("gender");
  const [image, setImage] = useState("");
  const [progress, setProgress] = useState();
  const [fileInfo, setFileInfo] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("");

  // ---------- Helpers ----------
  const pad = (n) => (n < 10 ? "0" + n : n);

  // Format UTC using moment.utc (reliable)
  const formatUTC = (dateInput) => {
    if (!dateInput) return "Chưa có thông tin";
    const m = moment.utc(dateInput);
    if (!m.isValid()) return "Không hợp lệ";
    return m.format("DD/MM/YYYY HH:mm:ss");
  };

const computeElapsedFrom = (dateInput) => {
  if (!dateInput) return "0 ngày 0 giờ 0 phút 0 giây";

  const createdAt = new Date(dateInput);
  const now = new Date();

  // 🧠 Backend lưu UTC → ta cần trừ đi 7 tiếng để về giờ Việt Nam
  const createdAtVN = new Date(createdAt.getTime() - 7 * 60 * 60 * 1000);

  let diff = now.getTime() - createdAtVN.getTime();
  if (diff < 0) diff = 0; // tránh âm

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
};

useEffect(() => {
  console.log(">>> DEBUG user:", user);
  if (!user || !user.createdAt) {
    console.log(">>> DEBUG no createdAt yet");
    setElapsedTime("Đang tính...");
    return;
  }

  console.log(">>> DEBUG createdAt raw:", user.createdAt);
  console.log(">>> DEBUG new Date(createdAt):", new Date(user.createdAt).toString());
  console.log(">>> DEBUG createdAt ms:", new Date(user.createdAt).getTime(), " now ms:", Date.now());

  const update = () => {
    const val = computeElapsedFrom(user.createdAt);
    console.log(">>> DEBUG elapsed:", val);
    setElapsedTime(val);
  };

  update();
  const timer = setInterval(update, 1000);
  return () => { clearInterval(timer); console.log(">>> DEBUG cleared timer"); };
}, [user?.createdAt]);



  // ---------- Lifecycle ----------
  useEffect(() => {
    if (current === null) {
      toast.dismiss();
      toast.warning("Vui lòng đăng nhập");
      navigate("/sign-in");
    }
  }, [current, navigate]);

  useEffect(() => {
    if (update) {
      dispatch(getUser());
      dispatch(refresh());
    }
  }, [update, dispatch]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    reset({
      fullname: user?.name,
      image: user?.avatar,
      email: user?.email,
      sdt: user?.phone,
      dateOfBirth: user?.dateOfBirth,
      gender: user?.gender,
      createdAt: user?.createdAt,
    });
    setImage(getValues("image"));

    // if backend provides avatar meta, populate fileInfo
    if (user?.avatarMeta) {
      setFileInfo({
        name: user.avatarMeta.name,
        size: user.avatarMeta.size,
        uploadedAt: user.avatarMeta.uploadedAt, // assume backend already in UTC string
      });
    }
  }, [status, reset, user, getValues]);

  useEffect(() => {
  if (!user?.createdAt) {
    setElapsedTime("");
    return;
  }
  setElapsedTime(computeElapsedFrom(user.createdAt));
  const id = setInterval(() => {
    setElapsedTime(computeElapsedFrom(user.createdAt));
  }, 1000);
  return () => clearInterval(id);
}, [user]);



  // ---------- Image upload ----------
  const handleSelectImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
//Tải ảnh lên hiện giờ, tên file
    setFileInfo({
  name: file.name,
  size: (file.size / 1024).toFixed(2) + " KB",
  uploadedAt: moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss"),
});


    const urlImage = await handleUpLoadImage(file);
    setImage(urlImage);
  };

  const handleUpLoadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axios({
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
      url: "https://api.imgbb.com/1/upload?key=faf46b849aaf25c8587aec2835f05b26",
      onUploadProgress: (data) => {
        setProgress(Math.round((100 * data.loaded) / data.total));
      },
    });
    return response.data.data.url;
  };

  const handleDeleteImage = () => {
    setImage("");
    setProgress(0);
    setFileInfo(null);
  };

  // ---------- Update ----------
  const handleUpdate = (values) => {
    if (!isValid) return;
    const cloneValues = {
      ...values,
      gender: getValues("gender"),
      dateOfBirth: getValues("dateOfBirth"),
      avatar: image,
      name: values.fullname,
      phone: values.sdt,
    };
    try {
      dispatch(updateInfoUser(cloneValues));
      toast.dismiss();
      toast.success("Cập nhật thông tin thành công", { pauseOnHover: false });
    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
    }
  };

  // ---------- Export PDF (UTC times, currentDate in UTC) ----------
  const handleExportPDF = async () => {
    const removeVietnameseTones = (str) => {
      if (!str) return "";
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    };

    const doc = new jsPDF("p", "mm", "a4");
    const values = getValues();
    const genderLabel =
      values.gender === "nam" ? "Nam" : values.gender === "nữ" ? "Nữ" : "Khác";

    // background & border
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 10, 190, 277, "F");
    doc.setDrawColor(255, 102, 0);
    doc.setLineWidth(1.2);
    doc.roundedRect(12, 12, 186, 273, 5, 5);

    // logo (optional)
    try {
      const logoUrl = "/logo.png";
      const logo = await fetch(logoUrl)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        );
      doc.addImage(logo, "PNG", 20, 18, 25, 25);
    } catch (err) {
      // ignore
    }

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(255, 102, 0);
    doc.setFontSize(22);
    doc.text(removeVietnameseTones("VHH SHOP"), 105, 28, { align: "center" });

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(removeVietnameseTones("Ho so tai khoan nguoi dung"), 105, 38, {
      align: "center",
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(25, 42, 185, 42);

    // avatar in PDF
    if (image) {
      try {
        const imgData = await fetch(image)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              })
          );
        doc.addImage(imgData, "JPEG", 150, 55, 40, 40);
        doc.setDrawColor(255, 102, 0);
        doc.circle(170, 75, 22);
      } catch (err) {
        // ignore
      }
    }

    // times using UTC
    const createdDate = user?.createdAt ? formatUTC(user.createdAt) : "";
    const elapsed = user?.createdAt ? computeElapsedFrom(user.createdAt) : "";

    const fileInfoString = fileInfo
      ? `${fileInfo.name} (${fileInfo.size}) - ${fileInfo.uploadedAt}`
      : "Không có";

    const info = [
      ["Họ và tên", values.fullname || ""],
      ["Email", values.email || ""],
      ["Số điện thoại", values.sdt || ""],
      ["Ngày sinh", values.dateOfBirth || ""],
      ["Giới tính", genderLabel],
      ["Ngày tạo tài khoản", createdDate],
      ["Thời gian đã tạo", elapsed],
      ["Ảnh đã tải lên", fileInfoString],
    ];

    doc.setFontSize(12);
    let y = 60;
    const lineHeight = 10;
    info.forEach(([label, value]) => {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(removeVietnameseTones(`${label}:`), 25, y);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const maxWidth = 110;
      const lines = doc.splitTextToSize(removeVietnameseTones(String(value)), maxWidth);
      doc.text(lines, 70, y);
      y += lineHeight * lines.length + 4;
    });

     // Thời gian xuất file (VN)
    const currentDateVN = moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(removeVietnameseTones(`Xuất file lúc (VN): ${currentDateVN}`), 25, 250);
    doc.text(removeVietnameseTones("Ký tên:"), 150, 250);
    doc.line(170, 249, 195, 249);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      removeVietnameseTones("Cảm ơn bạn đã sử dụng dịch vụ của VHH Shop"),
      105,
      270,
      { align: "center" }
    );

    doc.save(`HoSo_${removeVietnameseTones(values.fullname || "NguoiDung")}.pdf`);
  };

  // ---------- UI ----------
  return (
    <div className="bg-white rounded-lg">
      <DashboardHeading title="Thông tin tài khoản" className="px-5 py-5" />

      {status === action_status.SUCCEEDED && (
        <form className="pb-16" onSubmit={handleSubmit(handleUpdate)}>
          <Field>
            <Label>Ảnh đại diện</Label>
            <ImageUpload
              onChange={handleSelectImage}
              className="mx-auto"
              progress={progress}
              image={image}
              handleDeleteImage={handleDeleteImage}
            />
            {fileInfo ? (
              <p className="text-gray-700 text-sm mt-2 text-center">
                {fileInfo.name} ({fileInfo.size}) - {fileInfo.uploadedAt} (UTC)
              </p>
            ) : (
              <p className="text-gray-500 text-sm mt-2 text-center">Không có ảnh</p>
            )}
          </Field>

          <Field>
            <Label>Họ tên</Label>
            <Input name="fullname" control={control} type="text" />
            {errors.fullname && (
              <p className="text-red-500 text-base font-medium">{errors.fullname?.message}</p>
            )}
          </Field>

          <Field>
            <Label>Email</Label>
            <Input name="email" control={control} disabled />
          </Field>

          <Field>
            <Label>Số điện thoại</Label>
            <Input name="sdt" type="number" control={control} />
            {errors.sdt && (
              <p className="text-red-500 text-base font-medium">{errors.sdt?.message}</p>
            )}
          </Field>

          <Field>
            <Label>Ngày sinh</Label>
            <Input name="dateOfBirth" type="date" control={control} />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-base font-medium">{errors.dateOfBirth?.message}</p>
            )}
          </Field>

          <Field>
            <FieldCheckboxes>
              <Label>Giới tính</Label>
              <Radio
                name="gender"
                control={control}
                checked={watchGender === Gender.NAM}
                value={Gender.NAM}
                onClick={() => setValue("gender", "nam")}
              >
                Nam
              </Radio>
              <Radio
                name="gender"
                control={control}
                checked={watchGender === Gender.NU}
                value={Gender.NU}
                onClick={() => setValue("gender", "nữ")}
              >
                Nữ
              </Radio>
              <Radio
                name="gender"
                control={control}
                checked={watchGender === Gender.Diff}
                value={Gender.Diff}
                onClick={() => setValue("gender", "khác")}
              >
                Khác
              </Radio>
            </FieldCheckboxes>
            {errors.gender && (
              <p className="text-red-500 text-base font-medium">{errors.gender?.message}</p>
            )}
          </Field>

          <Field>
            <Label>Ngày tạo tài khoản</Label>
            <p className="text-gray-700 font-medium">{formatUTC(user?.createdAt)}</p>
          </Field>

          <Field>
            <Label>Thời gian đã tạo tài khoản</Label>
            <p className="text-gray-700 font-medium">{elapsedTime || "Đang tính..."}</p>
          </Field>

          <div className="flex justify-center mt-5">
            <Button kind="secondary" type="button" className="w-[200px]" onClick={handleExportPDF}>
              📄 Xuất thông tin PDF
            </Button>
          </div>

          <Button
            kind="primary"
            className="mx-auto w-[200px] mt-10"
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            height="50px"
          >
            Cập nhật thông tin
          </Button>
        </form>
      )}
    </div>
  );
};

export default UserAccount;
