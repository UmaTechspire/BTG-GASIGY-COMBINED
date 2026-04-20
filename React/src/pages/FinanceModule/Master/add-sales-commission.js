import React, { useState, useEffect } from "react";
import {
    Card, CardBody, Col, Container, Row, Label, FormGroup, Modal, ModalBody,
    ModalHeader, Input, Button as StrapButton, UncontrolledAlert
} from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    SaveSalesCommission, GetAllSalesCommissionListing, GetSalesCommissionById,
    UpdateSalesCommissionStatus, SaveTab1List, fetchGasList
} from "../../../common/data/mastersapi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { startOfToday, format } from "date-fns";

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CustomerName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    GasName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
});

const AddSalesCommission = () => {
    const history = useHistory();
    const [commissions, setCommissions] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [filteredCommissions, setFilteredCommissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [searchGas, setSearchGas] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial data for dropdowns
    const [customerList, setCustomerList] = useState([]);
    const [gasList, setGasList] = useState([]);

    const initialValues = {
        customerId: "",
        gasId: "",
        sellingPrice: "",
        effectiveFrom: new Date(),
        members: [{ contact: "", rate: "" }]
    };

    const [formInitialValues, setFormInitialValues] = useState(initialValues);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const validationSchema = Yup.object().shape({
        customerId: Yup.string().required("Customer is required"),
        gasId: Yup.string().required("Gas is required"),
        sellingPrice: Yup.number().typeError("Must be a number").required("Selling Price is required").min(0, "Price cannot be negative"),
        effectiveFrom: Yup.date().required("Effective From Date is required"),
    });

    const loadDropdownData = async () => {
        try {
            const branchId = 1;
            const customers = await SaveTab1List(branchId);
            if (customers) setCustomerList(customers);
            const gases = await fetchGasList(branchId, 0);
            if (gases) setGasList(gases);
        } catch (error) {
            console.error("Error loading dropdown data:", error);
        }
    };

    const getAllCommissions = async (customerId = "", gasId = "") => {
        setLoading(true);
        try {
            const result = await GetAllSalesCommissionListing({ customerId, gasId });
            if (result.status) {
                const data = result.data || [];
                setCommissions(data);
                setFilteredCommissions(data);
                const initialSwitchStates = {};
                data.forEach(item => {
                    initialSwitchStates[item.Id] = item.IsActive === 1;
                });
                setSwitchStates(initialSwitchStates);
            } else {
                setCommissions([]);
                setFilteredCommissions([]);
                setSwitchStates({});
            }
        } catch (err) {
            console.error("Error fetching commissions:", err);
            setCommissions([]);
            setFilteredCommissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDropdownData();
        getAllCommissions();
    }, []);

    useEffect(() => {
        if (errorMsg || successMsg) {
            const timer = setTimeout(() => {
                setErrorMsg(null);
                setSuccessMsg(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg, successMsg]);

    const clearFilter = () => {
        setSearchCustomer("");
        setSearchGas("");
        setGlobalFilterValue("");
        setFilters(initFilters());
        getAllCommissions("", "");
    };

    const handleSearch = () => {
        getAllCommissions(searchCustomer, searchGas);
    };

    const handleSearchCancel = () => {
        setSearchCustomer("");
        setSearchGas("");
        getAllCommissions();
    };

    const handleSubmit = async (values) => {
        const date = new Date(values.effectiveFrom);
        date.setHours(0, 0, 0, 0);
        const formattedDate = date.toISOString().split('T')[0];

        const payload = {
            customerId: values.customerId,
            gasId: values.gasId,
            sellingPrice: values.sellingPrice,
            effectiveFrom: formattedDate,
            Members: values.members.filter(m => m.contact && m.contact.trim() !== "").map(m => ({
                Contact: m.contact,
                Rate: m.rate
            })),
            IsActive: 1,
            BranchId: 1,
            OrgId: 1,
            UserId: 1
        };

        if (editMode && values.Id) {
            payload.Id = values.Id;
        }

        try {
            setIsSubmitting(true);
            const response = await SaveSalesCommission(payload);
            if (response.status) {
                setIsModalOpen(false);
                setSuccessMsg(response.message || "Sales Commission saved successfully!");
                toast.success(response.message || "Saved successfully!");
                getAllCommissions();
            } else {
                setErrorMsg(response.message || "Failed to save.");
                toast.error(response.message || "Failed to save.");
            }
        } catch (error) {
            console.error("Error saving commission:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);
        if (value === "") {
            setFilteredCommissions(commissions);
            return;
        }
        const filtered = commissions.filter(item =>
            ["CustomerName", "GasName"].some(field =>
                item[field] && String(item[field]).toLowerCase().includes(value)));
        setFilteredCommissions(filtered);
    };

    const openModal2Status = (rowData) => {
        setSelectedRow(rowData);
        setTxtStatus(rowData.IsActive === 1 ? "deactivate" : "activate");
        setIsModalOpen2(true);
    };

    const onSwitchChange = async () => {
        try {
            if (!selectedRow) return;
            const newStatus = selectedRow.IsActive === 1 ? 0 : 1;
            const payload = {
                Id: selectedRow.Id,
                IsActive: newStatus,
                UserId: 1
            };
            const response = await UpdateSalesCommissionStatus(payload);
            if (response?.status) {
                setSwitchStates(prev => ({ ...prev, [selectedRow.Id]: newStatus === 1 }));
                setSuccessMsg(`Status updated successfully!`);
                getAllCommissions();
            } else {
                setErrorMsg("Failed to update status!");
            }
        } catch (error) {
            console.error("Status update error:", error);
        } finally {
            setIsModalOpen2(false);
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <span onClick={() => handleEdit(rowData.Id)} title="Edit" style={{ cursor: 'pointer' }}>
                    <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                </span>
            </div>
        );
    };

    const handleEdit = async (id) => {
        try {
            const result = await GetSalesCommissionById(id);
            if (result && result.status) {
                const data = result.data;
                setFormInitialValues({
                    Id: data.Id,
                    customerId: data.CustomerId,
                    gasId: data.GasId,
                    sellingPrice: data.SellingPrice,
                    effectiveFrom: new Date(data.EffectiveFrom),
                    members: data.Members || []
                });
                setEditMode(true);
                setIsModalOpen(true);
            } else {
                setErrorMsg("Record not found");
            }
        } catch (error) {
            console.error("Failed to fetch by ID:", error);
        }
    };

    const statusBodyTemplate = (rowData) => (
        <div className="square-switch">
            <Input
                type="checkbox"
                id={`square-switch-${rowData.Id}`}
                switch="bool"
                onChange={() => openModal2Status(rowData)}
                checked={switchStates[rowData.Id] ?? rowData.IsActive === 1}
            />
            <label htmlFor={`square-switch-${rowData.Id}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
        </div>
    );

    const openNewModal = () => {
        setFormInitialValues({
            ...initialValues,
            members: [{ contact: "", rate: "" }]
        });
        setEditMode(false);
        setIsModalOpen(true);
    };

    const renderHeader = () => (
        <div className="row align-items-center g-3">
            <div className="col-lg-3">
                <Button className="btn btn-danger" onClick={clearFilter} outlined>
                    <i className="mdi mdi-filter-off label-icon" /> Clear
                </Button>
            </div>
            <div className="col-lg-3 offset-lg-6">
                <Input
                    type="text"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                />
            </div>
        </div>
    );

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Sales Commission" />
                    <Row>
                        {errorMsg && <UncontrolledAlert color="danger">{errorMsg}</UncontrolledAlert>}
                        {successMsg && <UncontrolledAlert color="success">{successMsg}</UncontrolledAlert>}

                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid px-3 py-2">
                                <div className="col-12 col-lg-8">
                                    <div className="row align-items-center">
                                        <div className="col-md-5 d-flex align-items-center">
                                            <Label className="mb-0 me-2" style={{ minWidth: '80px' }}>Customer</Label>
                                            <Input type="select" value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)}>
                                                <option value="">All Customers</option>
                                                {customerList.map((c, i) => <option key={i} value={c.value}>{c.label}</option>)}
                                            </Input>
                                        </div>
                                        <div className="col-md-5 d-flex align-items-center ms-auto">
                                            <Label className="mb-0 me-2" style={{ minWidth: '50px' }}>Gas</Label>
                                            <Input type="select" value={searchGas} onChange={e => setSearchGas(e.target.value)}>
                                                <option value="">All Gas</option>
                                                {gasList.map((g, i) => <option key={i} value={g.value}>{g.label}</option>)}
                                            </Input>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items">
                                    <button type="button" className="btn btn-info" onClick={handleSearch}>
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={handleSearchCancel}>
                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i> Cancel
                                    </button>
                                    <button type="button" className="btn btn-success" onClick={openNewModal}>
                                        <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i> New
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </Row>

                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable
                                    value={filteredCommissions} paginator rows={10}
                                    loading={loading} dataKey="Id" filters={filters}
                                    globalFilterFields={["CustomerName", "GasName"]}
                                    header={renderHeader()}
                                    emptyMessage="No commissions found." onFilter={(e) => setFilters(e.filters)}>
                                    <Column field="CustomerName" header="Customer" filter filterPlaceholder="Search Customer" />
                                    <Column field="GasName" header="Gas" filter filterPlaceholder="Search Gas" />
                                    <Column header="Contact Name" body={(rowData) => rowData.Members?.map(m => m.Contact).join(', ') || rowData.ContactName || ''} />
                                    <Column header="Rate" body={(rowData) => rowData.Members?.map(m => m.Rate).join(', ') || rowData.Rate || ''} />
                                    <Column field="SellingPrice" header="Selling Price" />
                                    <Column field="EffectiveFrom" header="Effective Date" body={(rowData) => rowData.EffectiveFrom ? format(new Date(rowData.EffectiveFrom), 'dd-MMM-yyyy') : ''} />
                                    <Column field="IsActive" header="Active" body={statusBodyTemplate} style={{ textAlign: 'center' }} />
                                    <Column body={actionBodyTemplate} header="Action" style={{ textAlign: 'center' }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} size="lg" toggle={toggleModal}>
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">
                        {editMode ? "Edit Sales Commission" : "New Sales Commission"}
                    </ModalHeader>
                    <ModalBody>
                        <Formik
                            enableReinitialize
                            initialValues={formInitialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ errors, touched, setFieldValue, values }) => (
                                <Form>
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label className="fw-bold required-label">Customer</Label>
                                                <Field name="customerId" as="select" className="form-control form-select">
                                                    <option value="">Select Customer</option>
                                                    {customerList.map((c, i) => <option key={i} value={c.value}>{c.label}</option>)}
                                                </Field>
                                                <ErrorMessage name="customerId" component="div" className="text-danger" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <Label className="fw-bold required-label">Gas</Label>
                                                <Field name="gasId" as="select" className="form-control form-select">
                                                    <option value="">Select Gas</option>
                                                    {gasList.map((g, i) => <option key={i} value={g.value}>{g.label}</option>)}
                                                </Field>
                                                <ErrorMessage name="gasId" component="div" className="text-danger" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label className="fw-bold required-label">Selling Price</Label>
                                                <Field name="sellingPrice" type="number" className="form-control" />
                                                <ErrorMessage name="sellingPrice" component="div" className="text-danger" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label className="fw-bold required-label">Effective From Date</Label>
                                                <DatePicker
                                                    selected={values.effectiveFrom}
                                                    dateFormat="dd-MMM-yyyy"
                                                    className="form-control"
                                                    onChange={(date) => setFieldValue("effectiveFrom", date)}
                                                />
                                                <ErrorMessage name="effectiveFrom" component="div" className="text-danger" />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <hr />
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0 fw-bold">Commission Contacts</h5>
                                        <StrapButton
                                            color="success"
                                            size="sm"
                                            style={{
                                                backgroundColor: "#28a745",
                                                borderColor: "#28a745",
                                                color: "#fff",
                                                padding: "2px 10px",
                                                fontSize: "12px"
                                            }}
                                            className="fw-bold no-hover-change"
                                            onClick={() => {
                                                const newMembers = [...values.members, { contact: "", rate: "" }];
                                                setFieldValue("members", newMembers);
                                            }}
                                        >
                                            + Add
                                        </StrapButton>
                                    </div>

                                    <table className="table table-bordered">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="fw-bold" style={{ width: '46%' }}>Contact Name</th>
                                                <th className="fw-bold" style={{ width: '46%' }}>Rate</th>
                                                <th className="fw-bold" style={{ width: '80px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {values.members.map((member, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <Input
                                                            type="text"
                                                            value={member.contact}
                                                            onChange={(e) => {
                                                                const newMembers = [...values.members];
                                                                newMembers[index].contact = e.target.value;
                                                                setFieldValue("members", newMembers);
                                                            }}
                                                            placeholder="Enter name"
                                                            className="form-control"
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input
                                                            type="number"
                                                            value={member.rate}
                                                            onChange={(e) => {
                                                                const newMembers = [...values.members];
                                                                newMembers[index].rate = e.target.value;
                                                                setFieldValue("members", newMembers);
                                                            }}
                                                            placeholder="0.00"
                                                            className="form-control"
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <StrapButton
                                                            color="danger"
                                                            size="sm"
                                                            style={{
                                                                backgroundColor: "#f46a6a",
                                                                borderColor: "#f46a6a",
                                                                color: "#fff"
                                                            }}
                                                            className="no-hover-change"
                                                            onClick={() => {
                                                                const newMembers = values.members.filter((_, i) => i !== index);
                                                                setFieldValue("members", newMembers);
                                                            }}
                                                        >
                                                            <i className="bx bx-trash"></i>
                                                        </StrapButton>
                                                    </td>
                                                </tr>
                                            ))}
                                            {values.members.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-muted">No members added yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>


                                    <div className="text-end mt-4">
                                        <StrapButton type="submit" color="primary" className="fw-bold px-4 py-2 me-2" style={{ backgroundColor: "#2196f3", borderColor: "#2196f3" }} disabled={isSubmitting}>
                                            <i className="bx bx-save font-size-18 align-middle me-2"></i>
                                            {isSubmitting ? editMode ? "Updating..." : "Saving..." : editMode ? "Update" : "Save"}
                                        </StrapButton>
                                        <StrapButton type="button" color="danger" className="fw-bold px-4 py-2" style={{ backgroundColor: "#e74c3c", borderColor: "#e74c3c" }} onClick={toggleModal}>
                                            <i className="bx bx-x-circle font-size-18 align-middle me-2"></i> Cancel
                                        </StrapButton>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>
                </div>
            </Modal>

            <Modal isOpen={isModalOpen2} toggle={() => setIsModalOpen2(false)} centered>
                <ModalBody className="py-3 px-5 text-center">
                    <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "5em", color: "orange" }} />
                    <h4 className="mt-2">Do you want to {txtStatus} this item?</h4>
                    <div className="mt-4 button-items">
                        <StrapButton color="success" size="lg" onClick={onSwitchChange}>Yes</StrapButton>
                        <StrapButton color="danger" size="lg" onClick={() => setIsModalOpen2(false)}>Cancel</StrapButton>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default AddSalesCommission;