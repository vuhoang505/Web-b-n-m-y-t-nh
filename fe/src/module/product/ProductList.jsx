import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductItem from "./ProductItem";
import slugify from "slugify";
import Pagination from "react-js-pagination";
import ModalAdvanced from "../../components/Modal/ModalAdvanced";
import { formatPrice } from "../../utils/formatPrice";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

const ProductList = ({ data, handlePageClick, page, totalPage }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // ✅ Xử lý click vào sản phẩm để xem chi tiết
  const handleClick = (item) => {
    const path = slugify(item.title, { strict: true });
    navigate(`/${path}/${item._id}`);
  };

  // ✅ Thêm sản phẩm vào danh sách so sánh (chặn trùng)
  const addToCompare = (item) => {
    setSelectedItems((prev) => {
      if (prev.some((p) => p._id === item._id)) return prev; // tránh thêm trùng
      return [...prev, item];
    });
  };

  // ✅ Xóa sản phẩm khỏi danh sách so sánh
  const removeFromCompare = (item) => {
    setSelectedItems((prev) => prev.filter((p) => p._id !== item._id));
  };

  // ✅ Tự động mở modal khi có đủ 2 sản phẩm
  useEffect(() => {
    if (selectedItems.length === 2) setShowModal(true);
  }, [selectedItems]);

  // ✅ Vô hiệu cuộn khi mở modal
  useEffect(() => {
    const body = document.body;
    if (showModal) disableBodyScroll(body);
    else enableBodyScroll(body);
  }, [showModal]);

  return (
    <>
      <div className="mt-20">
        <div className="flex flex-col container rounded-lg bg-white">
          <div className="flex items-center justify-between p-5">
            <span className="font-bold text-xl">Laptop</span>
            <div
              className="flex items-center gap-x-1 cursor-pointer"
              onClick={() => navigate("/product")}
            >
              <span className="text-base text-[#a497a2] font-semibold">
                Xem tất cả
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </div>

          {/* ✅ Danh sách sản phẩm */}
          <div className="grid-cols-5 grid gap-y-2 pb-10 items-stretch">
            {data.length > 0 &&
              data.map((item, index) => (
                <ProductItem
                  key={index}
                  product={item}
                  onClickItem={() => handleClick(item)}
                  className="border-2 border-solid border-[#f6f6f6]"
                  selected={selectedItems}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                />
              ))}
          </div>
        </div>

        {/* ✅ Phân trang */}
        <div className="flex justify-center items-center">
          <Pagination
            activePage={page}
            nextPageText=">"
            prevPageText="<"
            totalItemsCount={totalPage}
            itemsCountPerPage={1}
            firstPageText="<<"
            lastPageText=">>"
            linkClass="page-num"
            onChange={handlePageClick}
          />
        </div>
      </div>

      {/* ✅ Modal so sánh sản phẩm */}
      {selectedItems.length === 2 && (
        <ModalAdvanced
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedItems([]);
          }}
          bodyClassName="w-[1050px] bg-white rounded-lg relative z-10 content overflow-hidden"
        >
          <div className="overflow-y-auto h-[600px] p-10">
            <table className="table-product items-center table-fixed w-full">
              <thead>
                <tr>
                  <th></th>
                  <th className="text-base font-semibold">Sản phẩm 1</th>
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
                  <td className="text-base font-semibold">Giá tiền</td>
                  <td>{formatPrice(selectedItems[0]?.promotion)}</td>
                  <td>{formatPrice(selectedItems[1]?.promotion)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ModalAdvanced>
      )}
    </>
  );
};

export default ProductList;
