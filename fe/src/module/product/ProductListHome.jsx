import React, { useEffect, useState } from "react";
import ProductItem from "../product/ProductItem";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCards } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import ModalAdvanced from "../../components/Modal/ModalAdvanced";
import { formatPrice } from "../../utils/formatPrice";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

const ProductListHome = ({ data, bg = "", className = "" }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // ✅ Thêm sản phẩm vào danh sách so sánh
  const addToCompare = (item) => {
    setSelectedItems((prev) => {
      if (prev.some((p) => p._id === item._id)) return prev; // tránh thêm trùng
      return [...prev, item];
    });
  };

  // ✅ Xóa sản phẩm khỏi danh sách so sánh
  const removeFromCompare = (item) => {
    const filteredItems = selectedItems.filter(
      (product) => product._id !== item._id
    );
    setSelectedItems(filteredItems);
  };

  // ✅ Mở modal khi có đủ 2 sản phẩm
  useEffect(() => {
    if (selectedItems.length === 2) {
      setShowModal(true);
    }
  }, [selectedItems]);

  // ✅ Chặn cuộn trang khi modal mở
  useEffect(() => {
    if (showModal) disableBodyScroll(document.body);
    else enableBodyScroll(document.body);
  }, [showModal]);

  // ✅ Khi nhấn vào sản phẩm
  const handleClick = (item) => {
    const path = slugify(item.title, { strict: true });
    navigate(`/${path}/${item._id}`);
  };

  return (
    <div className={`${className}`}>
      <div
        className={`container ${
          bg === "bg1" ? 'bg-[url("../images/bg-laptop.png")] h-[460px]' : ""
        } ${
          bg === "bg2" ? 'bg-[url("../images/bg-laptop-1.png")] h-[460px]' : ""
        } bg-no-repeat w-full bg-cover rounded-lg`}
      >
        <Swiper
          modules={[Navigation, Pagination, EffectCards]}
          slidesPerView={5}
          slidesPerGroup={5}
          navigation
          pagination={{ clickable: true }}
          className={`w-full rounded-lg ${className}`}
        >
          {data.length > 0 &&
            data.map((item) => (
              <SwiperSlide key={item._id}>
                <ProductItem
                  product={item}
                  onClickItem={() => handleClick(item)}
                  selected={selectedItems}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* ✅ Modal so sánh sản phẩm */}
      {selectedItems.length === 2 && (
        <ModalAdvanced
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedItems([]);
          }}
          bodyClassName="w-[1050px] bg-white p-10 rounded-lg relative z-10 content h-[600px] overflow-y-auto overflow-x-hidden"
        >
          <table className="table-product items-center table-fixed w-full">
            <thead>
              <tr>
                <th></th>
                <th className="text-base font-semibold items-start">
                  Sản phẩm 1
                </th>
                <th className="text-base font-semibold">Sản phẩm 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-base font-semibold">Ảnh sản phẩm</td>
                <td>
                  <img
                    src={
                      selectedItems[0]?.images?.[0] ||
                      "https://via.placeholder.com/200x200?text=No+Image"
                    }
                    alt=""
                    className="w-[200px] h-[200px] object-cover mx-auto"
                  />
                </td>
                <td>
                  <img
                    src={
                      selectedItems[1]?.images?.[0] ||
                      "https://via.placeholder.com/200x200?text=No+Image"
                    }
                    alt=""
                    className="w-[200px] h-[200px] object-cover mx-auto"
                  />
                </td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Tên sản phẩm</td>
                <td>{selectedItems[0]?.title}</td>
                <td>{selectedItems[1]?.title}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Thương hiệu</td>
                <td>{selectedItems[0]?.brandName}</td>
                <td>{selectedItems[1]?.brandName}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Hệ điều hành</td>
                <td>{selectedItems[0]?.os}</td>
                <td>{selectedItems[1]?.os}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Màu sắc</td>
                <td>{selectedItems[0]?.color}</td>
                <td>{selectedItems[1]?.color}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">CPU</td>
                <td>{selectedItems[0]?.cpu}</td>
                <td>{selectedItems[1]?.cpu}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Màn hình</td>
                <td>{selectedItems[0]?.screen}</td>
                <td>{selectedItems[1]?.screen}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Graphic Card</td>
                <td>{selectedItems[0]?.graphicCard}</td>
                <td>{selectedItems[1]?.graphicCard}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Pin</td>
                <td>{selectedItems[0]?.battery}</td>
                <td>{selectedItems[1]?.battery}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Nhu cầu</td>
                <td>{selectedItems[0]?.demand}</td>
                <td>{selectedItems[1]?.demand}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Ram</td>
                <td>{selectedItems[0]?.ram}</td>
                <td>{selectedItems[1]?.ram}</td>
              </tr>
              <tr>
                <td className="text-base font-semibold">Khối lượng</td>
                <td>{selectedItems[0]?.weight}</td>
                <td>{selectedItems[1]?.weight}</td>
              </tr>
              <tr>
                <td className="text-lg font-semibold">Giá tiền</td>
                <td>{formatPrice(selectedItems[0]?.promotion)}</td>
                <td>{formatPrice(selectedItems[1]?.promotion)}</td>
              </tr>
            </tbody>
          </table>
        </ModalAdvanced>
      )}
    </div>
  );
};

export default ProductListHome;
