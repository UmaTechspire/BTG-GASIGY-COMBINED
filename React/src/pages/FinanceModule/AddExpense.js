import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Button,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import "flatpickr/dist/themes/material_blue.css";
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPettyCashCurrency,
  saveOrUpdatePettyCash,
  GetPettyCashSeqNum,
  getPettyCashCategories,
  getPettyCashExpenseTypes,
  getPettyCashGroupById,
  saveCashReceipt
} from "../../../src/common/data/mastersapi";
import makeAnimated from "react-select/animated";
import Swal from 'sweetalert2';
import { format } from "date-fns";

import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

const getUserDetails = () => {
  if (localStorage.getItem("authUser")) {
    try {
      return JSON.parse(localStorage.getItem("authUser"));
    } catch (e) {
      return null;
    }
  }
  return null;
};

const Breadcrumbs = ({ title, breadcrumbItem }) => (
  <div className="page-title-box d-sm-flex align-items-center justify-content-between">
    <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
    <div className="page-title-right">
      <ol className="breadcrumb m-0">
        <li className="breadcrumb-item"><a href="/#">{title}</a></li>
        <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
      </ol>
    </div>
  </div>
);
const animatedComponents = makeAnimated();

const ALLOWED_EXPENSE_TYPES = {
  "Sales Expenses": [
    "Fuel Expenses",
    "Repair and Maintenance of Vehicle Expense"
  ],
  "Administrative & General Expenses": [
    "Handphone Expenses",
    "Office Electricity Expenses",
    "Tube & Machine Maintenance Expense",
    "Office Administrative Expense",
    "Entertainment Expense",
    "Transportation Expense",
    "Employees Welfare Expense",
    "Factory Utilities Expenses",
    "Maintenance Programmer Expense",
    "Document Clearance Expense",
    "Document Clearence Expenses",
    "Other Operational Expense"
  ],
  "Non-Operational Expenses": [
    "Bank Administrative Expense",
    "Other Non Operational Expenses"
  ]
};

const AddExpense = () => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [currencySuggestions, setCurrencySuggestions] = useState([]);
  const [generatedPCNumber, setGeneratedPCNumber] = useState("");
  const [expenseOptionsMap, setExpenseOptionsMap] = useState({}); // Cache for expense types per category
  const [initialData, setInitialData] = useState(null);

  const history = useHistory();
  const location = useLocation();
  const isEditMode = !!id;

  // Custom styles for React-Select to match standard Input height and look
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      borderRadius: '0.25rem',
      borderColor: state.isFocused ? '#2684ff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(38, 132, 255, 0.25)' : null,
      '&:hover': {
        borderColor: '#ced4da'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '38px',
      padding: '0 6px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '38px'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };

  useEffect(() => {
    fetchDropdownData();
    if (isEditMode) {
      fetchExistingData(id);
    } else {
      fetchSeqNo();
    }
  }, [id, isEditMode]);

  const fetchExistingData = async (pettyId) => {
    try {
      const branchId = 1;
      const orgId = 1;
      const res = await getPettyCashGroupById(pettyId, branchId, orgId);
      if (res && res.length > 0) {
        const firstItem = res[0];
        const pcNumber = firstItem.pc_number;
        const allItems = res;

        setInitialData({
          pcNumber: pcNumber,
          voucherNo: firstItem.voucherno || firstItem.VoucherNo || "",
          expDate: firstItem.expdate ? new Date(firstItem.expdate) : (firstItem.ExpDate ? new Date(firstItem.ExpDate) : new Date()),
          currencyid: firstItem.currencyid,
          exchangeRate: firstItem.exchangerate || firstItem.exchangeRate || 1,
          attachment: null,
          ExpenseFileName: firstItem.expensefilename || firstItem.ExpenseFileName,
          items: allItems.map(item => ({
            PettyCashId: item.pettycashid || item.PettyCashId,
            category: item.category_id,
            expenseType: item.expense_type_id,
            expenseDescription: item.expensedescription || item.ExpenseDescription || "",
            whom: item.whom || item.Whom || "",
            amount: item.amount || item.Amount || 0,
            amountIDR: item.amountidr || item.AmountIDR || 0
          })),
          IsSubmitted: firstItem.issubmitted || firstItem.IsSubmitted
        });

        const uniqueCats = [...new Set(allItems.map(i => i.category_id))];
        uniqueCats.forEach(catId => {
          if (catId) loadExpenseTypes(catId);
        });
      }
    } catch (err) {
      console.error("Failed to fetch existing data", err);
      toast.error("Failed to load expense details");
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [currencies, categories] = await Promise.all([
        getPettyCashCurrency(1, 1),
        getPettyCashCategories(1, 1),
      ]);

      setCurrencySuggestions(currencies);

      const excludeLabels = ["operational expenses", "non operational revenue", "non-operational revenue"];
      const formattedCategories = categories
        .map(item => ({
          value: item.id,
          label: item.category_name
        }))
        .filter(cat => cat.value && cat.label && !excludeLabels.includes(cat.label.toLowerCase()));

      const cashBookTransfer = { value: 6, label: "Cash Book Transfer" };
      const hasCashBookTransfer = formattedCategories.some(c => c.value === 6);
      if (!hasCashBookTransfer) {
        formattedCategories.push(cashBookTransfer);
      }

      setCategoryOptions(formattedCategories);
    } catch (err) {
      console.error("Failed to load dropdown data", err);
    }
  };

  const fetchSeqNo = async () => {
    try {
      const res = await GetPettyCashSeqNum(1, 1, 1);
      if (res?.data?.VoucherNo) {
        setGeneratedPCNumber(`PC${String(res.data.VoucherNo).padStart(6, '0')}`);
      }
    } catch (err) {
      console.error("Failed to fetch sequence number", err);
    }
  };

  const loadExpenseTypes = async (categoryId) => {
    if (!categoryId || expenseOptionsMap[String(categoryId)]) return;
    try {
      console.log(`Fetching expense types for category: ${categoryId}`);
      const rows = await getPettyCashExpenseTypes(1, 1, categoryId);

      // Get the category name to filter its sub-types
      const categoryObj = categoryOptions.find(o => String(o.value) === String(categoryId));
      const categoryLabel = categoryObj ? categoryObj.label : null;

      let formatted = rows.map(item => ({
        value: item.id,
        label: item.expense_type
      }));

      // Apply filtering based on ALLOWED_EXPENSE_TYPES map
      if (categoryLabel && ALLOWED_EXPENSE_TYPES[categoryLabel]) {
        const allowedList = ALLOWED_EXPENSE_TYPES[categoryLabel];
        formatted = formatted.filter(item => {
          const itemLabel = item.label.toLowerCase().trim();
          return allowedList.some(allowed => {
            const normalizedAllowed = allowed.toLowerCase().trim();
            // Handle slight name differences (e.g. Entertainment vs Entertaiment in user request)
            return itemLabel.includes(normalizedAllowed) || normalizedAllowed.includes(itemLabel);
          });
        });
      }

      setExpenseOptionsMap(prev => ({ ...prev, [String(categoryId)]: formatted }));
    } catch (err) {
      console.error("Failed to load expense types", err);
    }
  };

  const currencyOptions = useMemo(() => {
    const allowed = ['IDR', 'USD', 'MYR', 'SGD', 'CNY'];
    return currencySuggestions
      .filter(c => allowed.includes(c.CurrencyCode || c.currency_code || c.Currency || c.currency))
      .map(c => ({
        value: c.CurrencyId || c.currencyid || c.id,
        label: c.Currency || c.CurrencyCode || c.currency || c.currency_code,
        ExchangeRate: c.ExchangeRate || c.exchange_rate || c.rate || 1
      }));
  }, [currencySuggestions]);

  const validationSchema = useMemo(() => Yup.object().shape({
    expDate: Yup.date().required("Date is required"),
    currencyid: Yup.number().required("Currency is required"),
    items: Yup.array().of(
      Yup.object().shape({
        category: Yup.number()
          .transform((v, o) => (o === "" ? null : v))
          .required("Required"),
        expenseType: Yup.number()
          .transform((v, o) => (o === "" ? null : v))
          .nullable()
          .when("category", (category, schema) => {
            return category === 6 ? schema.notRequired() : schema.required("Required");
          }),
        expenseDescription: Yup.string().required("Required").max(100),
        amount: Yup.number()
          .transform((v, o) => (o === "" ? null : v))
          .required("Required")
          .positive(),
        whom: Yup.string().required("Required")
      })
    ).min(1, "At least one item is required")
  }), []);

  const handleSave = async (values, isPost, validateForm, setTouched, resetForm) => {
    // Manually trigger validation before proceeding
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setTouched(errors);
      toast.error("Please fill all required fields");
      return;
    }

    const result = await Swal.fire({
      title: `Are you sure you want to ${isPost ? "Post" : "Save"}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

    if (!result.isConfirmed) return;

    try {
      setIsSubmitting(true);

      const header = {
        PettyCashId: isEditMode ? parseInt(id) : 0,
        pcNumber: values.pcNumber,
        VoucherNo: values.voucherNo || "",
        ExpDate: format(values.expDate, "yyyy-MM-dd"),
        currencyid: parseInt(values.currencyid),
        exchangeRate: values.exchangeRate,
        IsSubmitted: (isPost || !!values.IsSubmitted) ? 1 : 0,
        OrgId: 1,
        BranchId: 1,
        Who: "Payer"
      };

      const payload = values.items.map(item => ({
        category: parseInt(item.category),
        expenseType: parseInt(item.expenseType),
        expenseDescription: item.expenseDescription,
        whom: item.whom,
        amount: parseFloat(item.amount)
      }));

      const body = {
        command: isEditMode ? "Update" : "Insert",
        Header: header,
        payload: payload
      };

      await saveOrUpdatePettyCash(body, isEditMode, values.attachment);

      // --- REVERSE AUTOMATION: CASH BOOK TRANSFER ---
      if (isPost) {
        const transferItems = values.items.filter(item => parseInt(item.category) === 6);
        if (transferItems.length > 0) {
          const userData = getUserDetails();
          const cashBookItems = transferItems.map(item => ({
            receipt_id: 0,
            customer_id: 0, // Using 0 as 'Whom' is free-text
            cash_amount: Math.abs(parseFloat(item.amount || 0)), // Positive for Debit/Receipt
            receipt_date: format(values.expDate, "yyyy-MM-dd"),
            reference_no: `${values.pcNumber} | ${item.whom}`,
            transaction_type: 'transfer',
            status: 'Posted',
            is_posted: true,
            currencyid: parseInt(values.currencyid)
          }));

          const cashPayload = {
            orgId: 1,
            branchId: 1,
            userId: userData?.u_id || 505,
            userIp: "127.0.0.1",
            header: cashBookItems
          };

          try {
            await saveCashReceipt(cashPayload);
            console.log("Cash Book automated entry created for transfers");
          } catch (cbErr) {
            console.error("Failed to create automated Cash Book entry", cbErr);
            toast.warning("Petty Cash saved, but failed to sync with Cash Book.");
          }
        }
      }

      toast.success(`Petty Cash ${isPost ? "posted" : "saved"} successfully`);

      if (isEditMode) {
        history.push("/pettyCash");
      } else {
        // Stay in the add page and reset for next entry
        fetchSeqNo();
        resetForm();
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save Petty Cash");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [defaultCurrencyId, setDefaultCurrencyId] = useState(null);
  const [defaultExchangeRate, setDefaultExchangeRate] = useState(1);

  useEffect(() => {
    if (!isEditMode && currencyOptions.length > 0 && !defaultCurrencyId) {
      const idr = currencyOptions.find(c => c.label === "IDR");
      if (idr) {
        setDefaultCurrencyId(idr.value);
        setDefaultExchangeRate(idr.ExchangeRate);
      }
    }
  }, [currencyOptions, isEditMode, defaultCurrencyId]);

  const initialValues = useMemo(() => {
    return initialData || {
      pcNumber: generatedPCNumber,
      voucherNo: "",
      expDate: new Date(),
      currencyid: defaultCurrencyId,
      exchangeRate: defaultExchangeRate,
      attachment: null,
      items: [
        {
          category: null,
          expenseType: null,
          expenseDescription: "",
          whom: "",
          amount: "",
          amountIDR: ""
        }
      ]
    };
  }, [initialData, generatedPCNumber, defaultCurrencyId, defaultExchangeRate]);

  const formatWithCommas = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const parts = val.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const parseNumber = (val) => {
    if (typeof val === "string") {
      return val.replace(/,/g, "");
    }
    return val;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={() => { }}
        >
          {({ values, errors, touched, setFieldValue, handleChange, validateForm, setTouched, resetForm }) => (
            <Form>
              <Breadcrumbs title="Finance" breadcrumbItem="Petty Cash" />

              <Card>
                <CardBody>
                  <Row className="mb-3">
                    <Col className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        onClick={() => handleSave(values, false, validateForm, setTouched, () => setFieldValue('items', [{ category: null, expenseType: null, expenseDescription: "", whom: "", amount: "", amountIDR: "" }]))}
                      >
                        <i className="bx bx-check me-1"></i> {isEditMode ? "Update" : "Save"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-success"
                        disabled={isSubmitting || !!values.IsSubmitted}
                        onClick={() => handleSave(values, true, validateForm, setTouched, () => setFieldValue('items', [{ category: null, expenseType: null, expenseDescription: "", whom: "", amount: "", amountIDR: "" }]))}
                      >
                        <i className="bx bx-save me-1"></i> Post
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => history.push("/pettyCash")}
                      >
                        <i className="bx bx-window-close me-1"></i> Close
                      </button>
                    </Col>
                  </Row>

                  {/* Header Section */}
                  <Row className="mb-4">
                    <Col md={4}>
                      <FormGroup>
                        <Label>Reference number</Label>
                        <Input value={values.pcNumber} readOnly disabled={!!values.IsSubmitted} className="bg-light" />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label className="required-label">Date</Label>
                        <Flatpickr
                          className="form-control"
                          value={values.expDate}
                          onChange={([date]) => setFieldValue("expDate", date)}
                          options={{ dateFormat: "d-M-Y" }}
                        />
                        {errors.expDate && touched.expDate && <small className="text-danger">{errors.expDate}</small>}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label className="required-label">Currency</Label>
                        <Select
                          styles={customSelectStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          menuPlacement="auto"
                          options={currencyOptions}
                          value={currencyOptions.find(c => String(c.value) === String(values.currencyid)) || null}
                          onChange={opt => {
                            console.log("Currency selected:", opt);
                            setFieldValue("currencyid", opt ? opt.value : null);
                            setFieldValue("exchangeRate", opt ? opt.ExchangeRate : 1);
                            values.items.forEach((item, index) => {
                              const idr = (item.amount || 0) * (opt ? opt.ExchangeRate : 1);
                              setFieldValue(`items.${index}.amountIDR`, idr.toFixed(2));
                            });
                          }}
                        />
                        {errors.currencyid && touched.currencyid && <small className="text-danger">{errors.currencyid}</small>}
                      </FormGroup>
                    </Col>
                  </Row>

                  <hr />

                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <div className="table-responsive">
                        <Table bordered hover className="align-middle">
                          <thead className="table-light text-center">
                            <tr>
                              <th style={{ width: "15%" }}>Category</th>
                              <th style={{ width: "15%" }}>Expense Type</th>
                              <th style={{ width: "25%" }}>Description</th>
                              <th style={{ width: "20%" }}>Whom</th>
                              <th style={{ width: "12%" }}>Amount</th>
                              <th style={{ width: "13%" }}>Amount (IDR)</th>

                            </tr>
                          </thead>
                          <tbody>
                            {values.items.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <Select
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    menuPlacement="auto"
                                    options={categoryOptions}
                                    value={categoryOptions.find(o => String(o.value) === String(item.category)) || null}
                                    onChange={opt => {
                                      const catId = opt ? opt.value : null;
                                      console.log(`Category selected for row ${index}:`, opt);
                                      setFieldValue(`items.${index}.category`, catId);
                                      setFieldValue(`items.${index}.expenseType`, null);
                                      if (catId) {
                                        // Defer fetching to ensure selection is registered first
                                        setTimeout(() => {
                                          loadExpenseTypes(catId);
                                        }, 0);
                                      }
                                    }}
                                  />
                                  {errors.items?.[index]?.category && touched.items?.[index]?.category && <small className="text-danger">{errors.items[index].category}</small>}
                                </td>
                                <td>
                                  <Select
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    menuPlacement="auto"
                                    isDisabled={String(item.category) === "6"}
                                    options={expenseOptionsMap[String(item.category)] || []}
                                    value={String(item.category) === "6" ? null : (expenseOptionsMap[String(item.category)] || []).find(o => String(o.value) === String(item.expenseType)) || null}
                                    onChange={opt => {
                                      console.log(`Expense Type selected for row ${index}:`, opt);
                                      setFieldValue(`items.${index}.expenseType`, opt ? opt.value : null);
                                    }}
                                    placeholder={String(item.category) === "6" ? "N/A" : "Select Type"}
                                  />
                                  {item.category !== 6 && errors.items?.[index]?.expenseType && touched.items?.[index]?.expenseType && (
                                    <small className="text-danger">{errors.items[index].expenseType}</small>
                                  )}
                                </td>
                                <td>
                                  <Input
                                    name={`items.${index}.expenseDescription`}
                                    value={item.expenseDescription}
                                    onChange={handleChange}
                                    maxLength={100}
                                  />
                                  {errors.items?.[index]?.expenseDescription && touched.items?.[index]?.expenseDescription && <small className="text-danger">{errors.items[index].expenseDescription}</small>}
                                </td>
                                <td>
                                  <Input
                                    name={`items.${index}.whom`}
                                    value={item.whom}
                                    onChange={handleChange}
                                  />
                                  {errors.items?.[index]?.whom && touched.items?.[index]?.whom && <small className="text-danger">{errors.items[index].whom}</small>}
                                </td>
                                <td>
                                  <Input
                                    type="text"
                                    name={`items.${index}.amount`}
                                    value={formatWithCommas(item.amount)}
                                    onChange={e => {
                                      const rawVal = parseNumber(e.target.value);
                                      if (rawVal === "" || /^\d*\.?\d*$/.test(rawVal)) {
                                        setFieldValue(`items.${index}.amount`, rawVal);
                                        const idr = (parseFloat(rawVal) || 0) * values.exchangeRate;
                                        setFieldValue(`items.${index}.amountIDR`, idr.toFixed(2));
                                      }
                                    }}
                                    className="text-end"
                                  />
                                  {errors.items?.[index]?.amount && touched.items?.[index]?.amount && <small className="text-danger">{errors.items[index].amount}</small>}
                                </td>
                                <td>
                                  <Input
                                    value={formatWithCommas(item.amountIDR)}
                                    readOnly
                                    className="bg-light text-end"
                                  />
                                </td>

                              </tr>
                            ))}
                          </tbody>
                        </Table>

                      </div>
                    )}
                  </FieldArray>

                  {/* Redundant bottom buttons removed */}
                </CardBody>
              </Card>
            </Form>
          )}
        </Formik>
      </Container>
    </div>
  );
};

export default AddExpense;
