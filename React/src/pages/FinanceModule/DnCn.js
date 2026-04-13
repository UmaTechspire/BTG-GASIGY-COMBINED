import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
    Container,
    Card,
    CardBody,
    Row,
    Col,
    Label,
    Button,
    Collapse
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from 'primereact/api';
import { getAllDebitNotes, getAllCreditNotes, getCustomersDNCN } from "../../common/data/mastersapi";

const DnCn = () => {
    const history = useHistory();
    // Dates
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    // Toggle State
    const [isDebitOpen, setIsDebitOpen] = useState(true);
    const [isCreditOpen, setIsCreditOpen] = useState(false);

    // Grid Data & loading
    const [debitNotes, setDebitNotes] = useState([]);
    const [creditNotes, setCreditNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters (Shared or separate? Let's keep them separate state but controlled by one input if desired, or separate inputs. 
    // User said "look exactly like JournalCtx". JournalCt has one global search. 
    // I will use one global search state that applies to BOTH tables for convenience, or separate if they are distinct.)
    // Let's us separate filters to avoid confusion if columns differ.
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Customers for mapping
            const custRes = await getCustomersDNCN();
            const customerMap = {};
            if (custRes && custRes.status === "success") {
                custRes.data.forEach(c => {
                    customerMap[c.Id] = c.CustomerName;
                });
            }

            // Fetch Debit Notes
            const debitRes = await getAllDebitNotes();
            if (debitRes && debitRes.status === "success") {
                const formattedDebit = debitRes.data.map(d => ({
                    ...d,
                    DebitNoteId: d.DebitNoteId,
                    dnNo: d.DebitNoteNumber || d.DebitNoteNo,
                    date: d.TransactionDate || d.Date,
                    amount: d.Amount || d.DebitAmount || 0,
                    description: d.Description,
                    customer: customerMap[d.CustomerId] || d.CustomerId,
                    invoiceNo: d.InvoiceId || d.InvoiceNo, // Showing ID as that's what we have in main table
                    currency: d.CurrencyCode,
                    status: d.IsSubmitted ? "Posted" : "Saved"
                }));
                setDebitNotes(formattedDebit);
            }

            // Fetch Credit Notes
            const creditRes = await getAllCreditNotes();
            if (creditRes && creditRes.status === "success") {
                const formattedCredit = creditRes.data.map(c => ({
                    ...c,
                    CreditNoteId: c.CreditNoteId,
                    cnNo: c.CreditNoteNumber || c.CreditNoteNo,
                    date: c.TransactionDate || c.Date,
                    amount: c.Amount || c.CreditAmount || 0,
                    description: c.Description,
                    customer: customerMap[c.CustomerId] || c.CustomerId,
                    invoiceNo: c.InvoiceId || c.InvoiceNo,
                    currency: c.CurrencyCode,
                    status: c.IsSubmitted ? "Posted" : "Saved"
                }));
                setCreditNotes(formattedCredit);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { value, matchMode: FilterMatchMode.CONTAINS }
        }));
    };

    const clearFilter = () => {
        setGlobalFilterValue("");
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        });
    };

    const getSeverity = (status) => {
        switch (status) {
            case 'Posted': return 'success';
            case 'Saved': return 'danger';
            default: return 'info';
        }
    };

    const statusBodyTemplate = (rowData) => {
        const statusShort = rowData.status === "Saved" ? "S" : rowData.status === "Posted" ? "P" : rowData.status;
        return <Tag value={statusShort} severity={getSeverity(rowData.status)} />;
    };

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            .replace(/ /g, '-')
            .toLowerCase();
    };

    const dateBodyTemplate = (rowData) => {
        return formatDate(rowData.date);
    };

    // Shared Header for both tables or just one top control? 
    // User asked "look exactly like JournalCtx", which has the search bar INSIDE the card.
    // I will put the Search/Legend bar OUTSIDE the collapsible sections so it applies generally, 
    // OR replicate it inside. 
    // Replicating inside might be cleaner if they are treated as separate lists.
    // But let's try a common control bar above the accordions.

    const renderControlBar = () => {
        return (
            <Card className="mb-3">
                <CardBody className="p-3">
                    <div className="row align-items-center g-3 clear-spa">
                        <div className="col-12 col-lg-6">
                            <Button className="btn btn-danger btn-label" onClick={clearFilter} >
                                <i className="mdi mdi-filter-off label-icon" /> Clear
                            </Button>
                        </div>
                        <div className="col-12 col-lg-3 text-end">
                            <span className="me-4"><Tag value="S" severity={getSeverity("Saved")} /> Saved</span>
                            <span className="me-1"><Tag value="P" severity={getSeverity("Posted")} /> Posted</span>
                        </div>
                        <div className="col-12 col-lg-3">
                            <InputText
                                type="search"
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                placeholder="Keyword Search"
                                className="form-control"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex gap-2 justify-content-center">
                <span
                    className="text-primary cursor-pointer"
                    title="Edit"
                    style={{ cursor: 'pointer' }}
                    onClick={() => history.push({
                        pathname: `/edit-dn-cn/${rowData.dnNo ? rowData.DebitNoteId : rowData.CreditNoteId}`,
                        state: { type: rowData.dnNo ? 'debit' : 'credit' }
                    })}
                >
                    <i className="mdi mdi-square-edit-outline font-size-18"></i>
                </span>
                <span
                    className="text-danger cursor-pointer"
                    title="Delete"
                    style={{ cursor: 'pointer' }}
                >
                    <i className="mdi mdi-trash-can-outline font-size-18"></i>
                </span>
            </div>
        );
    };

    const amountBodyTemplate = (rowData) => {
        return (rowData.amount !== undefined && rowData.amount !== null) ? Number(rowData.amount).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2 }) : "0.00";
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="DN / CN" />

                {/* Top Actions & Date Filter */}
                <Row>
                    <Col lg="12">
                        <Card className="search-top">
                            <div className="row align-items-end g-1 quotation-mid">
                                <div className="col-12 col-lg-5 mt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        {/* From Date */}
                                        <div className="d-flex align-items-center gap-2">
                                            <Label className="form-label mb-0" style={{ minWidth: "40px" }}>From</Label>
                                            <Flatpickr
                                                className="form-control d-block"
                                                placeholder="dd-mm-yyyy"
                                                options={{
                                                    altInput: true,
                                                    altFormat: "d-M-Y",
                                                    dateFormat: "Y-m-d",
                                                }}
                                                value={fromDate}
                                                onChange={(date) => setFromDate(date[0])}
                                            />
                                        </div>
                                        {/* To Date */}
                                        <div className="d-flex align-items-center gap-2 ms-3">
                                            <Label className="form-label mb-0" style={{ minWidth: "20px" }}>To</Label>
                                            <Flatpickr
                                                className="form-control d-block"
                                                placeholder="dd-mm-yyyy"
                                                options={{
                                                    altInput: true,
                                                    altFormat: "d-M-Y",
                                                    dateFormat: "Y-m-d",
                                                }}
                                                value={toDate}
                                                onChange={(date) => setToDate(date[0])}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-lg-7 d-flex justify-content-end flex-wrap gap-2">
                                    <button type="button" className="btn btn-info">
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search
                                    </button>
                                    <button type="button" className="btn btn-danger">
                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i> Cancel
                                    </button>
                                    <button type="button" className="btn btn-secondary">
                                        <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Export
                                    </button>
                                    <button type="button" className="btn btn-primary">
                                        <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i> Print
                                    </button>
                                    <button type="button" className="btn btn-success" onClick={() => history.push("/add-dn-cn")}>
                                        <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i> New
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Global Controls (Filter/Legend) */}
                {renderControlBar()}

                {/* Debit Note Section */}
                <div className="accordion-item mb-2 border rounded">
                    <h2 className="accordion-header" id="headingDebit">
                        <button
                            className={`accordion-button ${!isDebitOpen ? 'collapsed' : ''} bg-light fw-bold`}
                            type="button"
                            onClick={() => setIsDebitOpen(!isDebitOpen)}
                            style={{ width: '100%', textAlign: 'left', padding: '1rem', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <span><i className="bx bx-file me-2"></i> Debit Note</span>
                            <i className={`bx ${isDebitOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
                        </button>
                    </h2>
                    <Collapse isOpen={isDebitOpen}>
                        <div className="accordion-body p-0">
                            <DataTable
                                value={debitNotes}
                                paginator
                                rows={5}
                                loading={loading}
                                dataKey="dnNo"
                                filters={filters}
                                globalFilterFields={['dnNo', 'description', 'customer', 'invoiceNo', 'status']}
                                emptyMessage="No Debit Notes found."
                                className="p-datatable-gridlines border-0"
                                showGridlines
                            >
                                <Column field="dnNo" header="Debit Note No" sortable style={{ minWidth: '120px' }} />
                                <Column field="date" header="Date" body={dateBodyTemplate} sortable style={{ minWidth: '100px' }} />
                                <Column field="description" header="Description" sortable style={{ minWidth: '150px' }} />
                                <Column field="customer" header="Customer" sortable style={{ minWidth: '200px' }} />
                                <Column field="invoiceNo" header="Invoice No" sortable style={{ minWidth: '120px' }} />
                                <Column field="amount" header="Amount" body={amountBodyTemplate} sortable className="text-end" style={{ minWidth: '120px' }} />
                                <Column field="currency" header="Currency" sortable className="text-center" style={{ minWidth: '100px' }} />
                                <Column field="status" header="Status" body={statusBodyTemplate} sortable className="text-center" style={{ minWidth: '100px' }} />
                                <Column header="Action" body={actionBodyTemplate} className="text-center" style={{ minWidth: '100px' }} />
                            </DataTable>
                        </div>
                    </Collapse>
                </div>

                {/* Credit Note Section */}
                <div className="accordion-item mb-2 border rounded">
                    <h2 className="accordion-header" id="headingCredit">
                        <button
                            className={`accordion-button ${!isCreditOpen ? 'collapsed' : ''} bg-light fw-bold`}
                            type="button"
                            onClick={() => setIsCreditOpen(!isCreditOpen)}
                            style={{ width: '100%', textAlign: 'left', padding: '1rem', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <span><i className="bx bx-file me-2"></i> Credit Note</span>
                            <i className={`bx ${isCreditOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
                        </button>
                    </h2>
                    <Collapse isOpen={isCreditOpen}>
                        <div className="accordion-body p-0">
                            <DataTable
                                value={creditNotes}
                                paginator
                                rows={5}
                                loading={loading}
                                dataKey="cnNo"
                                filters={filters}
                                globalFilterFields={['cnNo', 'description', 'customer', 'invoiceNo', 'status']}
                                emptyMessage="No Credit Notes found."
                                className="p-datatable-gridlines border-0"
                                showGridlines
                            >
                                <Column field="cnNo" header="Credit Note No" sortable style={{ minWidth: '120px' }} />
                                <Column field="date" header="Date" body={dateBodyTemplate} sortable style={{ minWidth: '100px' }} />
                                <Column field="description" header="Description" sortable style={{ minWidth: '150px' }} />
                                <Column field="customer" header="Customer" sortable style={{ minWidth: '200px' }} />
                                <Column field="invoiceNo" header="Invoice No" sortable style={{ minWidth: '120px' }} />
                                <Column field="amount" header="Amount" body={amountBodyTemplate} sortable className="text-end" style={{ minWidth: '120px' }} />
                                <Column field="currency" header="Currency" sortable className="text-center" style={{ minWidth: '100px' }} />
                                <Column field="status" header="Status" body={statusBodyTemplate} sortable className="text-center" style={{ minWidth: '100px' }} />
                                <Column header="Action" body={actionBodyTemplate} className="text-center" style={{ minWidth: '100px' }} />
                            </DataTable>
                        </div>
                    </Collapse>
                </div>

            </Container>
        </div>
    );
};

export default DnCn;
