/* eslint-disable no-unused-vars */
import React from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

import { loginAction } from "../redux/actions/UserAction";
import { TOKEN } from "../../utils/Config";

export default function Login(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Tài khoản không được để trống"),
      password: Yup.string().required("Mật khẩu không được để trống"),
    }),
    onSubmit: async (values) => {
      try {
        const result = await dispatch(loginAction(values));

        if (result?.success) {
          messageApi.success("Đăng nhập thành công!");
          console.log("result", result);

          const accessToken = result.data?.access;
          // const refreshToken = result.data?.refresh;

          if (accessToken) {
            localStorage.setItem(TOKEN, accessToken);
          }
          // if (refreshToken) {
          //   localStorage.setItem("refresh_token", refreshToken);
          // }

          navigate("/");
        } else {
          messageApi.error("Tài khoản hoặc mật khẩu không đúng!");
        }
      } catch (err) {
        messageApi.error("Đăng nhập thất bại!");
      }
    },
  });

  return (
    <>
      {contextHolder}
      <div className='flex justify-center items-center content-center h-screen'>
        <form
          onSubmit={formik.handleSubmit}
          className='lg:w-1/2 xl:max-w-screen-sm'
        >
          <div className='mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl'>
            <h2 className='text-center text-4xl text-indigo-900 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold'>
              Đăng nhập
            </h2>

            <div className='mt-12'>
              <div>
                <div className='text-sm font-bold text-gray-700 tracking-wide'>
                  Tài khoản
                </div>
                <input
                  name='email'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className='w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  placeholder='Nhập vào tài khoản'
                />
                {formik.touched.email && formik.errors.email && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.email}
                  </div>
                )}
              </div>

              <div className='mt-8'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm font-bold text-gray-700 tracking-wide'>
                    Mật khẩu
                  </div>
                  {/* <div>
                  <a className="text-xs font-display font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                    Quên mật khẩu ?
                  </a>
                </div> */}
                </div>
                <input
                  type='password'
                  name='password'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className='w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500'
                  placeholder='Nhập vào mật khẩu'
                />
                {formik.touched.password && formik.errors.password && (
                  <div className='text-red-500 text-sm mt-1'>
                    {formik.errors.password}
                  </div>
                )}
              </div>

              <div className='mt-10'>
                <button
                  type='submit'
                  className='bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide
                  font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600
                  shadow-lg'
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
