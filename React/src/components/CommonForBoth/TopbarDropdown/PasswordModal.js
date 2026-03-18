// components/PasswordModal.jsx
import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
} from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { Passwordupdate } from "../../../common/data/mastersapi";

const validationSchema = Yup.object({
  oldPass: Yup.string()
    .trim()
    .required("Current password is required"),
  newPass: Yup.string()
    .trim()
    .required("New password is required")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
    .matches(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
    .matches(/[0-9]/, "Must contain at least one digit (0-9)")
    .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character")
    .min(8, "Password must be at least 8 characters")
    .notOneOf([Yup.ref("oldPass")], "New password must be different from current password"),
  confirmPass: Yup.string()
    .trim()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPass")], "Passwords must match"),
});

export default function PasswordModal({ isOpen, onClose }) {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const user = JSON.parse(localStorage.getItem("authUser"));
      const res = await Passwordupdate({
        oldPassword: values.oldPass,
        Password: values.newPass,
        userid: String(user?.uid),
        Id: user?.u_id ? Number(user.u_id) : parseInt(user?.uid),
      });

      if (res.status) {
        Swal.fire({ icon: "success", title: "Success", text: res.message });
        onClose();
        setShowOldPass(false);
        setShowNewPass(false);
        setShowConfirmPass(false);
        setFocusedField(null);
      } else {
        Swal.fire({ icon: "error", title: "Exception", text: res.message });
        setFieldError("oldPass", res.message || "Change failed");
      }
    } catch {
      setFieldError("oldPass", "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setShowOldPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setFocusedField(null);
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Change Password</ModalHeader>
      <Formik
        initialValues={{ oldPass: "", newPass: "", confirmPass: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <ModalBody>
              <FormGroup>
                <Label>Current Password</Label>
                <div
                  className="input-group auth-pass-inputgroup"
                  onFocus={() => setFocusedField('oldPass')}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setFocusedField(null);
                    }
                  }}
                >
                  <Field
                    name="oldPass"
                    type={showOldPass ? "text" : "password"}
                    className="form-control"
                  />
                  {focusedField === 'oldPass' && (
                    <button
                      className="btn btn-light shadow-none"
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowOldPass(!showOldPass)}
                    >
                      <i className={"mdi " + (showOldPass ? "mdi-eye-off-outline" : "mdi-eye-outline")}></i>
                    </button>
                  )}
                </div>
                <ErrorMessage
                  name="oldPass"
                  component="div"
                  className="text-danger mt-1"
                />
              </FormGroup>

              <FormGroup>
                <Label>New Password</Label>
                <div
                  className="input-group auth-pass-inputgroup"
                  onFocus={() => setFocusedField('newPass')}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setFocusedField(null);
                    }
                  }}
                >
                  <Field
                    name="newPass"
                    type={showNewPass ? "text" : "password"}
                    className="form-control"
                  />
                  {focusedField === 'newPass' && (
                    <button
                      className="btn btn-light shadow-none"
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      <i className={"mdi " + (showNewPass ? "mdi-eye-off-outline" : "mdi-eye-outline")}></i>
                    </button>
                  )}
                </div>
                <ErrorMessage
                  name="newPass"
                  component="div"
                  className="text-danger mt-1"
                />
              </FormGroup>

              <FormGroup>
                <Label>Confirm Password</Label>
                <div
                  className="input-group auth-pass-inputgroup"
                  onFocus={() => setFocusedField('confirmPass')}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setFocusedField(null);
                    }
                  }}
                >
                  <Field
                    name="confirmPass"
                    type={showConfirmPass ? "text" : "password"}
                    className="form-control"
                  />
                  {focusedField === 'confirmPass' && (
                    <button
                      className="btn btn-light shadow-none"
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      <i className={"mdi " + (showConfirmPass ? "mdi-eye-off-outline" : "mdi-eye-outline")}></i>
                    </button>
                  )}
                </div>
                <ErrorMessage
                  name="confirmPass"
                  component="div"
                  className="text-danger mt-1"
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <Button color="secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}