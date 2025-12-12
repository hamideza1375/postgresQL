import * as Yup from "yup";

export const AuthValidator = Yup.object().shape({
    username: Yup.string().required(),
    email: Yup.string().email('ایمیل وارد شده صحیح نمیباشد').required('ایمیل خود را وارد کنید'),
    password: Yup.string().min(6,'رمز ورود نباید کوچکتر از 6 کارکتر باشد').max(20, 'رمز ورود نباید بزرگ تر از ۲۰ کارکتر باشد').required(),
});


export const ChangePasswordValidator = Yup.object().shape({
    email: Yup.string().email('ایمیل وارد شده صحیح نمیباشد').required('ایمیل خود را وارد کنید'),
    password: Yup.string().min(6,'رمز ورود نباید کوچکتر از 6 کارکتر باشد').max(20, 'رمز ورود نباید بزرگ تر از ۲۰ کارکتر باشد').required(),
});


// export const ResetPasswordValidator = Yup.object().shape({
//     password: Yup.string().min(6,'رمز ورود نباید کوچکتر از 6 کارکتر باشد').max(20, 'رمز ورود نباید بزرگ تر از ۲۰ کارکتر باشد').required(),
//     confirmPassword: Yup.string().required().oneOf([Yup.ref("password")],'تکرار پسورد با کادر پسورد تطابق ندارد'),
// });


// export const CheckCaptcha = Yup.object().shape({
//     code: Yup.string().required(),
//     check: Yup.string().required().oneOf([Yup.ref("code")],'کد وارد شده اشتباه هست'),
// });

// یعنی یکی از موارد داخل آرایه ای که بهش میدی باید باشه oneOf
// حتما باید بهش آرایه بدی چون با استفاده از حلقه ی  فورایچ دورش حلقه قراره زده بشه
