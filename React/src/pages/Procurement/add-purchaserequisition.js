import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Col, Card, CardBody, Container, FormGroup, Label, Row, TabContent, TabPane, NavItem, Table, Input, NavLink, InputGroup } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import classnames from "classnames";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import "flatpickr/dist/themes/material_blue.css"
import Flatpickr from "react-flatpickr"
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const AddPurchaseRequisition = () => {
    const history = useHistory();
    const [activeTab, setActiveTab] = useState(1);
    const API_URL = process.env.REACT_APP_API_URL;
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const initialValues = {
        code: "",
        name: "",
        email: "",
        phoneno: "",
        prDate: new Date(),
    };

    const validationSchema = Yup.object().shape({
        code: Yup.string().required("Code is required"),
        name: Yup.string().required("Name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        phoneno: Yup.string().required("Phone number is required"),
    });

    const handleSubmit = (values) => {
        console.log("Form values:", values);
    };

    const [supplierAddresses, setsupplierAddresses] = useState([
        { code: "CA001", name: "Sara", type: "Billing", suppliername: "Juli", address: "Test address" },
    ]);

    const [productpriceList, setProductpriceList] = useState([
        { GasCode: "CA001", Price: "10", Currency: "USD", FromDate: "20-JAN-2025", EndDate: "20-JAN-2026" },
    ]);

    const [customeraddressDetails, setCustomeraddressDetails] = useState([
        { code: "CA001", name: "Sara", scode: "SPA001", address: "Test Address" },
    ]);

    const handleRemoveItem = (index) => {
        const updatedDetails = supplierAddresses.filter((_, i) => i !== index);
        setsupplierAddresses(updatedDetails);
    };
    const handleCancel = () => {
        history.push("/manage-suppliers");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Procurement" breadcrumbItem="Add Purchase Requisition" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} >
                                        {({ errors, touched }) => (
                                            <Form>
                                                <div className="row align-items-center g-3 justify-content-end">
                                                    <div className="col-md-12 button-items">
                                                        <button type="button" className="btn btn-danger fa-pull-right" onClick={handleCancel}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                                        {/* <button type="button" className="btn btn-success fa-pull-right"><i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Post</button> */}
                                                        <button type="button" className="btn btn-info fa-pull-right" onClick={handleCancel}><i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save</button>
                                                    </div>
                                                </div>
                                                <Row className="mb-3">
                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="prtype" className="fw-bold">
                                                                PR Type.
                                                            </Label>
                                                            <Field as="select" name="prtype" className="form-select">
                                                                <option value="">Select </option>
                                                                <option value="1">General PR</option>
                                                                <option value="2">Bulk Gas PR </option>
                                                                <option value="2">Service Order PR </option>
                                                                <option value="2">Project Based PR </option>
                                                            </Field>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    {/* Row 1 */}
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="prNo">PR No.</Label>
                                                            <Field
                                                                name="prNo"
                                                                placeholder="PR No"
                                                                type="text"
                                                                className={`form-control ${errors.prNo && touched.prNo ? "is-invalid" : ""}`}
                                                            />
                                                            {/* <ErrorMessage name="prNo" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="supplier">Supplier</Label>
                                                            <Field as="select" name="supplier" className="form-select">
                                                                <option value="">Select Supplier</option>
                                                                <option value="1">Supplier 1</option>
                                                                <option value="2">Supplier 2</option>
                                                            </Field>
                                                            {/* <ErrorMessage name="supplier" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="paymentTerm">Payment Term</Label>
                                                            <Field as="select" name="paymentTerm" className="form-select">
                                                                <option value="">Select Payment Term</option>
                                                                <option value="120">120 DAYS</option>
                                                                <option value="60">60 DAYS</option>
                                                                <option value="45">45 DAYS</option>
                                                                <option value="30">30 DAYS</option>
                                                                <option value="cash">CASH</option>
                                                            </Field>
                                                            {/* <ErrorMessage name="paymentTerm" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    {/* Row 2 */}
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="prDate">PR Date</Label>
                                                            <Field name="prDate">
                                                                {({ field, form }) => (
                                                                    <Flatpickr
                                                                        {...field}
                                                                        options={{
                                                                            altInput: true,
                                                                            altFormat: "d-M-Y",
                                                                            dateFormat: "Y-m-d",
                                                                        }}
                                                                        className={`form-control ${form.errors.prDate && form.touched.prDate ? "is-invalid" : ""}`}
                                                                        onChange={date => form.setFieldValue("prDate", date[0])}
                                                                    />
                                                                )}
                                                            </Field>
                                                        </FormGroup>

                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="address">Sup. Address</Label>
                                                            <Field
                                                                name="address"
                                                                placeholder="Supplier Address"
                                                                type="text"
                                                                className={`form-control ${errors.address && touched.address ? "is-invalid" : ""}`}
                                                            />
                                                            {/* <ErrorMessage name="address" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="deliveryTerm">Delivery Term</Label>
                                                            <Field as="select" name="deliveryTerm" className="form-select">
                                                                <option value="">Select </option>
                                                                <option value="1">FOB</option>
                                                                <option value="2"> CIF</option>
                                                                <option value="2"> C&F</option>
                                                            </Field>
                                                            {/* <ErrorMessage name="deliveryTerm" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    {/* Row 3 */}
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="requestor">Requestor</Label>
                                                            <Field as="select" name="requestor" className="form-select">
                                                                <option value="">Select Requestor</option>
                                                                <option value="sultan">Sultan</option>
                                                                <option value="mohammad">Mohammad</option>
                                                                <option value="anwar">Anwar</option>
                                                                <option value="shafiq">Shafiq</option>
                                                                <option value="sandy">Sandy</option>
                                                            </Field>
                                                            {/* <ErrorMessage name="requestor" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="name">Sup. Name</Label>
                                                            <Field
                                                                name="name"
                                                                placeholder="Name"
                                                                type="text"
                                                                className={`form-control ${errors.name && touched.name ? "is-invalid" : ""}`}
                                                            />
                                                            {/* <ErrorMessage name="name" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="deliveryAddress">BTG  Delivery Address</Label>
                                                            <Field
                                                                name="deliveryAddress"
                                                                placeholder="Delivery Address"
                                                                type="text"
                                                                className={`form-control ${errors.deliveryAddress && touched.deliveryAddress ? "is-invalid" : ""}`}
                                                            />
                                                            {/* <ErrorMessage name="deliveryAddress" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    {/* Row 4 */}
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="department">Department</Label>
                                                            <Field as="select" name="department" className="form-select">
                                                                <option value="">Select Department</option>
                                                                <option value="purchase">Purchase</option>
                                                                <option value="sales">Sales</option>
                                                                <option value="finance">Finance</option>
                                                            </Field>
                                                            {/* <ErrorMessage name="department" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="contact">Sup. Contact</Label>
                                                            <Field
                                                                name="contact"
                                                                placeholder="Contact"
                                                                type="text"
                                                                className={`form-control ${errors.contact && touched.contact ? "is-invalid" : ""}`}
                                                            />
                                                            {/* <ErrorMessage name="contact" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="email">Sup. Email</Label>
                                                            <Field
                                                                name="email"
                                                                placeholder="Email"
                                                                type="email"
                                                                className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`}
                                                            />
                                                            {/* <ErrorMessage name="email" component="div" className="invalid-feedback" /> */}
                                                        </FormGroup>
                                                    </Col>
                                                    <div className="col-xl-12">
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="remarks">Remarks</Label>
                                                                <textarea id="basicpill-address-input1" className="form-control" rows="3" placeholder="Remarks">
                                                                    Item 1 : Stock Valve for production pallet on cylinder - Request by Bu Himelda.
                                                                    Item 2-4 : Project Ethylene Oxide.
                                                                </textarea>
                                                            </FormGroup>
                                                        </Col>
                                                    </div>
                                                </Row>

                                            </Form>
                                        )}
                                    </Formik>
                                    <Table className="table mb-0">
                                        <thead style={{ backgroundColor: "#3e90e2" }}>
                                            <tr>
                                                <th className="text-center" style={{ width: "4%" }}>S.No.</th>
                                                <th className="text-center" style={{ width: "20%" }}>Item Name</th>
                                                <th className="text-center" style={{ width: "15%" }}>Department</th>
                                                <th className="text-center" style={{ width: "7%" }}>UOM</th>
                                                <th className="text-center" style={{ width: "7%" }}>Qty</th>
                                                <th className="text-center" style={{ width: "8%" }}>Avail. Stock</th>
                                                <th className="text-center" style={{ width: "10%" }}>Del. Date</th>
                                                <th className="text-center" style={{ width: "8%" }}>Previous PO Price</th>
                                                <th className="text-center" style={{ width: "8%" }}>Unit Price</th>
                                                <th className="text-center" style={{ width: "8%" }}>Discount</th>
                                                <th className="text-center" style={{ width: "8%" }}>Tax %</th>
                                                <th className="text-center" style={{ width: "8%" }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[1, 2, 3, 4].map((row, index) => {
                                                const amounts = ["3225.00", "338000.00", "33580.00", "7252.00"];

                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center align-middle">{row}</td>
                                                        <td className="text-center align-middle">
                                                            <select defaultValue="" className="form-select">
                                                                <option value="">Choose...</option>
                                                                <option value="1">Japan BBB Neriki HW w/o Safety Device</option>
                                                                <option value="2">Japan BBB Neriki HW w/o Safety</option>
                                                            </select>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <select defaultValue="" className="form-select">
                                                                <option value="">Choose...</option>
                                                                <option value="1">Str</option>
                                                                <option value="2">Eng</option>
                                                            </select>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <select defaultValue="" className="form-select">
                                                                <option value="">Choose...</option>
                                                                <option value="1">Pc</option>
                                                                <option value="2">Unit</option>
                                                            </select>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <Input type="text" inputMode="numeric" className="text-end" maxLength={10} />
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <Input type="text" inputMode="numeric" className="text-end" maxLength={10} />
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <Flatpickr
                                                                className="form-control d-block"
                                                                placeholder="dd-mm-yyyy"
                                                                options={{
                                                                    altInput: true,
                                                                    altFormat: "d-M-Y",
                                                                    dateFormat: "Y-m-d",
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="text-end align-middle">
                                                            0.00
                                                        </td>
                                                        <td className="text-end align-middle">
                                                            <Input type="text" inputMode="numeric" className="text-end" maxLength={10} />
                                                        </td>
                                                        <td className="text-end align-middle">
                                                            0.00
                                                        </td>
                                                        <td className="text-end align-middle">
                                                            0.00
                                                        </td>
                                                        <td className="text-end align-middle">
                                                            {amounts[index]}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>


                                        <tfoot>
                                            <tr>
                                                <td colSpan={9} rowSpan={4}></td>
                                                <td className="align-middle text-end">
                                                    <strong>Sub Total</strong>
                                                </td>
                                                <td className="align-middle text-end">
                                                    SGD
                                                </td>
                                                <td className="align-middle text-end">
                                                    77057.00
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="align-middle text-end">
                                                    <strong>Discount</strong>
                                                </td>
                                                <td className="align-middle text-end">
                                                    SGD
                                                </td>
                                                <td className="align-middle text-end">
                                                    0.00
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="align-middle text-end">
                                                    <strong>Tax%</strong>
                                                </td>
                                                <td className="align-middle text-end">
                                                    SGD
                                                </td>
                                                <td className="align-middle text-end">
                                                    0.00
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="align-middle text-end">
                                                    <strong>Net Total</strong>
                                                </td>
                                                <td className="align-middle text-end">
                                                    SGD
                                                </td>
                                                <td className="align-middle text-end">
                                                    77057.00
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AddPurchaseRequisition
