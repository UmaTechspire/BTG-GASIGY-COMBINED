import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Label,
    Input,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import classnames from "classnames";
import { toast } from "react-toastify";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";

// --- API IMPORTS ---
import {
    GetAllGRNList,
    GetAllIRNList,
    GetAllSuppliers,
    GetAllCurrencies,
    GenerateSPC,
    GetGRNById,
    GetByIdPurchaseOrder,
    GetByIdPurchaseRequisition,
    GetAllPurchaseOrderList
} from "../../common/data/mastersapi";

const AP = () => {
    // --- Auth Context ---
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    const orgId = authUser?.orgId || 1;
    const branchId = authUser?.branchId || 1;
    const userId = authUser?.u_id || 1;

    // --- States ---
    const [activeTab, setActiveTab] = useState("1");
    const [filter, setFilter] = useState({
        supplier: null,
        currency: null,
        fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        toDate: new Date(),
    });

    const [supplierList, setSupplierList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [poLookup, setPoLookup] = useState({});

    const [accruedData, setAccruedData] = useState([]);
    const [payableData, setPayableData] = useState([]);
    const [selectedPayables, setSelectedPayables] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Search States ---
    const [globalFilterAccrued, setGlobalFilterAccrued] = useState("");
    const [globalFilterPayable, setGlobalFilterPayable] = useState("");

    // --- Modal States ---
    const [modal, setModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [nestedModal, setNestedModal] = useState(false);
    const [nestedPOData, setNestedPOData] = useState(null);
    const [nestedPOLoading, setNestedPOLoading] = useState(false);

    // PR Modal States
    const [prModal, setPrModal] = useState(false);
    const [prData, setPrData] = useState(null);
    const [prLoading, setPrLoading] = useState(false);

    // --- Styles ---


    // --- 1. Load Dropdowns & PO List ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const supRes = await GetAllSuppliers(orgId, branchId);
                if (supRes?.data) {
                    setSupplierList(supRes.data.map(s => ({ value: s.SupplierId, label: s.SupplierName })));
                }
                const curRes = await GetAllCurrencies({});
                if (curRes?.data) {
                    setCurrencyList(curRes.data.map(c => ({ value: c.CurrencyId, label: c.CurrencyCode })));
                }

                const poRes = await GetAllPurchaseOrderList(0, branchId, 0, orgId, userId);
                const poDataList = poRes?.data || (Array.isArray(poRes) ? poRes : []);
                
                if (poDataList && Array.isArray(poDataList)) {
                    const lookup = {};
                    poDataList.forEach(po => {
                        const pid = po.poid || po.POId || po.po_id || po.purchase_id;
                        if (pid) {
                            lookup[pid] = { 
                                pono: po.pono || po.PONo || po.PO_Number || po.ponumber || po.po_no || po.PONumber, 
                                podate: po.podate || po.PODate || po.po_date || po.docdate,
                                currencyid: po.currencyid || po.CurrencyId || po.currency_id || po.TransactionCurrencyId,
                                currencycode: po.currencycode || po.CurrencyCode || po.currency_code || po.transactioncurrency || po.TransactionCurrency
                            };
                        }
                    });
                    setPoLookup(lookup);
                }
            } catch (error) {
                console.error("Error loading initial data", error);
            }
        };
        loadInitialData();
    }, [orgId, branchId, userId]);

    const statusBodyTemplate = (rowData) => {
        const isSubmitted = rowData.IsSubmitted || rowData.issubmitted;
        return (
            <div className="d-flex justify-content-center align-items-center">
                <span 
                    className={classnames("badge rounded-circle d-flex align-items-center justify-content-center", {
                        "bg-success": isSubmitted,
                        "bg-danger": !isSubmitted
                    })}
                    style={{ width: "22px", height: "22px", fontSize: "12px", fontWeight: "bold", color: "#fff" }}
                    title={isSubmitted ? "Posted" : "Saved"}
                >
                    {isSubmitted ? "P" : "S"}
                </span>
            </div>
        );
    };

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    };

    // --- 2. Fetch Grid Data ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const formatForApi = (date) => {
                if (!date) return "";
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const fromDateStr = formatForApi(filter.fromDate);
            const toDateStr = formatForApi(filter.toDate);
            const supplierId = filter.supplier ? filter.supplier.value : 0;
            const currencyId = filter.currency ? filter.currency.value : 0;

            // Refresh PO Lookup locally for this fetch to ensure accuracy
            const poRes = await GetAllPurchaseOrderList(0, branchId, supplierId, orgId, userId);
            const poDataList = poRes?.data || (Array.isArray(poRes) ? poRes : []);
            const currentPoLookup = { ...poLookup };
            if (Array.isArray(poDataList)) {
                poDataList.forEach(po => {
                    const pid = po.poid || po.POId || po.po_id || po.purchase_id;
                    if (pid) {
                        currentPoLookup[pid] = {
                            pono: po.pono || po.PONo || po.PO_Number || po.ponumber || po.po_no || po.PONumber,
                            podate: po.podate || po.PODate || po.po_date || po.docdate,
                            currencyid: po.currencyid || po.CurrencyId || po.currency_id || po.TransactionCurrencyId,
                            currencycode: po.currencycode || po.CurrencyCode || po.currency_code || po.transactioncurrency || po.TransactionCurrency
                        };
                    }
                });
            }

            if (activeTab === "1") {
                // Fetch GRN list and IRN list in parallel
                const [grnResponse, irnResponse] = await Promise.all([
                    GetAllGRNList(supplierId, 0, orgId, branchId, userId, currencyId),
                    GetAllIRNList(branchId, orgId, supplierId, 0, fromDateStr, toDateStr, userId, currencyId)
                ]);

                if (grnResponse?.data && Array.isArray(grnResponse.data)) {
                    const grnLookup = {};
                    if (irnResponse?.data && Array.isArray(irnResponse.data)) {
                        irnResponse.data.forEach(irn => {
                            const grnId = irn.grn_id || irn.grnid;
                            if (grnId) {
                                if (!grnLookup[grnId]) {
                                    grnLookup[grnId] = { amount: 0, poid: irn.poid || 0 };
                                }
                                grnLookup[grnId].amount += (irn.totalamount || 0);
                            }
                        });
                    }

                    let mappedData = grnResponse.data
                        .filter(item => !grnLookup[item.grnid])
                        .map(item => {
                            const poId = item.poid || item.POId || item.purchase_id || item.po_id || 0;
                            const directPoNo = item.pono || item.po_number || item.ponumber || item.PONo || item.po_no || "";
                            const curId = item.currencyid || item.CurrencyId || item.currency_id || item.TransactionCurrencyId || (currentPoLookup[poId] ? (currentPoLookup[poId].currencyid || currentPoLookup[poId].CurrencyId) : 0);
                            const curCode = item.currencycode || item.CurrencyCode || item.transactioncurrency || item.TransactionCurrency || (currentPoLookup[poId] ? (currentPoLookup[poId].currencycode || currentPoLookup[poId].CurrencyCode) : "");

                            return {
                                Id: item.grnid || item.Id || item.grn_id,
                                Date: item.grndate || item.Date || item.grn_date,
                                Reference: item.grnno || item.Reference || item.grn_no,
                                POId: poId,
                                PONumber: directPoNo || (currentPoLookup[poId] ? currentPoLookup[poId].pono : ""),
                                Amount: Number(item.grnvalue || item.amount || item.Amount || item.total_amount || 0),
                                currencyid: Number(curId),
                                currencycode: curCode,
                                SupplierName: item.suppliername || item.SupplierName || "",
                                CreatedDate: item.CreatedDate || item.createddate || item.logdate || item.grndate || "",
                                CreatedBy: item.createdbyName || item.UserName || item.username || item.createdbyname || item.CreatedBy || "System",
                                IsSubmitted: item.issubmitted || item.IsSubmitted || false
                            };
                        });

                    const selectedCurrencyId = Number(currencyId);
                    if (selectedCurrencyId > 0) {
                        mappedData = mappedData.filter(item => Number(item.currencyid) === selectedCurrencyId);
                    }

                    if (filter.fromDate && filter.toDate) {
                        const fromTime = new Date(filter.fromDate).setHours(0, 0, 0, 0);
                        const toTime = new Date(filter.toDate).setHours(23, 59, 59, 999);
                        mappedData = mappedData.filter(item => {
                            const itemTime = item.Date ? new Date(item.Date).getTime() : 0;
                            return itemTime >= fromTime && itemTime <= toTime;
                        });
                    }

                    let cumulativeGRNTotal = 0;
                    mappedData = mappedData.map(item => {
                        cumulativeGRNTotal += item.Amount;
                        return { ...item, CumulativeAmount: cumulativeGRNTotal };
                    });

                    setAccruedData(mappedData);
                } else {
                    setAccruedData([]);
                }
            } else {
                const response = await GetAllIRNList(branchId, orgId, supplierId, 0, fromDateStr, toDateStr, userId, currencyId);
                if (response?.data && Array.isArray(response.data)) {
                    let cumulativeTotal = 0;
                    let mappedData = response.data.map(item => {
                        const poId = item.poid || item.POId || item.purchase_id || item.po_id || 0;
                        return {
                            Id: item.receiptnote_hdr_id || item.receipt_hdr_id || item.IRNId || item.id,
                            IRNId: item.receiptnote_hdr_id || item.receipt_hdr_id || item.IRNId || item.id,
                            Reference: item.receipt_no || item.Reference || item.receiptno || item.docno,
                            IRNDate: formatDate(item.receipt_date || item.receipt_Date || item.IRNDate || item.docdate),
                            POId: poId,
                            PONumber: item.pono || item.po_number || item.ponumber || item.PONo || item.po_no || (currentPoLookup[poId] ? currentPoLookup[poId].pono : ""),
                            OriginalAmount: Number(item.totalamount || item.amount || item.total_amount || 0),
                            currencyid: Number(item.currencyid || item.CurrencyId || item.currency_id || item.TransactionCurrencyId || (currentPoLookup[poId] ? (currentPoLookup[poId].currencyid || currentPoLookup[poId].CurrencyId) : 0)),
                            currencycode: item.currencycode || item.CurrencyCode || item.transactioncurrency || item.TransactionCurrency || (currentPoLookup[poId] ? (currentPoLookup[poId].currencycode || currentPoLookup[poId].CurrencyCode) : ""),
                            DueDate: item.due_dt || item.dueDate || item.DueDate || item.duedate || "",
                            grnid: item.grn_id || item.grnid || "0",
                            supplierid: item.supplierid || item.supplier_id || 0,
                            modeOfPaymentId: item.ModeOfPaymentId || item.modeOfPaymentId || 0,
                            invoiceno: item.receiptno || item.receipt_no || "",
                            invoicedate: item.receiptdate || item.receipt_Date || "",
                            duedate: item.due_dt || item.duedate || "",
                            po_amount: item.po_amount || 0,
                            adv_payment: item.adv_payment || 0,
                            balance_payment: item.balance_payment || 0,
                            alreadyrecivedamount: item.alreadyrecivedamount || 0,
                            balancepaymentamount: item.balancepaymentamount || 0
                        };
                    });



                    // Client-side filtering by currencyId
                    const selectedCurrencyId = Number(currencyId);
                    if (selectedCurrencyId > 0) {
                        mappedData = mappedData.filter(item => Number(item.currencyid) === selectedCurrencyId);
                    }

                    // Calculate cumulative total after filtering
                    cumulativeTotal = 0; // Reset cumulative total for filtered results
                    const processedData = mappedData.map(item => {
                        cumulativeTotal += item.OriginalAmount;
                        return { ...item, CumulativeAmount: cumulativeTotal };
                    });

                    setPayableData(processedData);
                } else {
                    setPayableData([]);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [activeTab, filter.fromDate, filter.toDate, filter.supplier, filter.currency, orgId, branchId, userId, poLookup]);

    const displayPONumber = (item) => {
        // Priority: 1. Direct PONumber field, 2. Lookup by POId
        const poNo = item.PONumber || (poLookup[item.POId] ? poLookup[item.POId].pono : null);
        if (poNo && poNo !== "-") {
            return (
                <span 
                    className="fw-bold cursor-pointer text-primary"
                    style={{ textDecoration: 'underline' }} 
                    onClick={() => handlePOClick(item.POId)}
                    title="View PO Details"
                >
                    {poNo}
                </span>
            );
        }
        return "-";
    };

    const renderHeader = (isAccrued = true) => {
        const filterValue = isAccrued ? globalFilterAccrued : globalFilterPayable;
        const setFilterValue = isAccrued ? setGlobalFilterAccrued : setGlobalFilterPayable;

        return (
            <div className="row align-items-center g-3">
                <div className="col-12 col-lg-6">
                    <Button 
                        className="btn btn-danger btn-label" 
                        onClick={handleClearFilter}
                    >
                        <i className="mdi mdi-filter-off label-icon" /> Clear
                    </Button>
                </div>
                <div className="col-12 col-lg-3 text-end">
                    {/* Placeholder for future tags/legends to keep alignment consistent with other pages */}
                </div>
                <div className="col-12 col-lg-3">
                    <InputText 
                        type="search" 
                        placeholder="Keyword Search" 
                        className="form-control" 
                        value={filterValue} 
                        onChange={(e) => setFilterValue(e.target.value)} 
                    />
                </div>
            </div>
        );
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            setSelectedPayables([]);
        }
    };

    const handleFilterChange = (key, value) => setFilter((prev) => ({ ...prev, [key]: value }));

    const handleClearFilter = () => {
        setFilter({
            supplier: null,
            currency: null,
            fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            toDate: new Date(),
        });
        setGlobalFilterAccrued("");
        setGlobalFilterPayable("");
    };

    const handleCheckboxChange = (id) => {
        setSelectedPayables((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };

    const totalPayableValue = useMemo(() => {
        if (payableData.length === 0) return 0;
        return payableData[payableData.length - 1].CumulativeAmount || 0;
    }, [payableData]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPayables(payableData.map((item) => item.IRNId || item.Id));
        } else {
            setSelectedPayables([]);
        }
    };

    const toggleModal = () => {
        setModal(!modal);
        if (modal) setModalData(null);
    };

    const toggleNestedModal = () => {
        setNestedModal(!nestedModal);
        if (nestedModal) setNestedPOData(null);
    };

    const handleGRNClick = async (grnId) => {
        setModalType("GRN");
        setModal(true);
        setModalLoading(true);
        try {
            const res = await GetGRNById(grnId, branchId, orgId);
            if (res.status && res.data) {
                setModalData(res.data);
            } else {
                toast.error("Failed to fetch GRN details");
                setModal(false);
            }
        } catch (err) {
            console.error(err);
            setModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleIRNClick = async (poId) => {
        if (!poId) {
            toast.warning("No linked PO found.");
            return;
        }
        setModalType("IRN");
        setModal(true);
        setModalLoading(true);
        try {
            const res = await GetByIdPurchaseOrder(poId, orgId, branchId);
            if (res.status && res.data) {
                setModalData(res.data);
            } else {
                toast.error("Failed to fetch details");
                setModal(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading details");
            setModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handlePOClick = async (poId) => {
        if (!poId) {
            toast.warning("No PO linked");
            return;
        }
        setModalType("PO");
        setModal(true);
        setModalLoading(true);
        try {
            const res = await GetByIdPurchaseOrder(poId, orgId, branchId);
            if (res.status && res.data) {
                setModalData(res.data);
            } else {
                toast.error("Failed to fetch PO details");
                setModal(false);
            }
        } catch (err) {
            console.error(err);
            setModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleNestedPOClick = async (poId) => {
        if (!poId) return;
        setNestedModal(true);
        setNestedPOLoading(true);
        try {
            const res = await GetByIdPurchaseOrder(poId, orgId, branchId);
            if (res.status && res.data) {
                setNestedPOData(res.data);
            } else {
                toast.error("Failed to fetch PO details");
                setNestedModal(false);
            }
        } catch (err) {
            console.error(err);
            setNestedModal(false);
        } finally {
            setNestedPOLoading(false);
        }
    };

    const togglePrModal = () => {
        setPrModal(!prModal);
        if (prModal) setPrData(null);
    };

    const handlePRClick = async (prId) => {
        if (!prId) {
            toast.warning("No PR linked.");
            return;
        }
        setPrModal(true);
        setPrLoading(true);
        try {
            const res = await GetByIdPurchaseRequisition(prId, branchId, orgId);
            if (res?.status && res?.data) {
                setPrData(res.data);
            } else {
                toast.error("Failed to fetch PR details");
                setPrModal(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading PR details");
            setPrModal(false);
        } finally {
            setPrLoading(false);
        }
    };

    const handleCreatePaymentClaim = async () => {
        if (selectedPayables.length === 0) {
            toast.warning("Select items to claim.");
            return;
        }
        try {
            // Build payload matching IRN page format: { item: [InvoiceReceiptEntry] }
            const selectedRows = payableData.filter(row =>
                selectedPayables.includes(row.IRNId || row.Id)
            );

            const payload = {
                item: selectedRows.map(row => ({
                    receiptnote_hdr_id: row.IRNId || row.Id || 0,
                    grnid: String(row.grnid || "0"),
                    poid: row.POId || 0,
                    ModeOfPaymentId: row.modeOfPaymentId || 0,
                    supplierid: row.supplierid || 0,
                    invoiceno: row.invoiceno || row.Reference || "",
                    invoicedate: row.invoicedate || "",
                    duedate: row.duedate || "",
                    paymenttermid: "0",
                    filepath: "",
                    filename: "",
                    spc: true,
                    isactive: true,
                    createdby: userId,
                    createdip: "",
                    modifiedip: "",
                    branchid: branchId,
                    orgid: orgId,
                    po_amount: parseFloat(row.po_amount) || 0,
                    adv_payment: parseFloat(row.adv_payment) || 0,
                    balance_payment: parseFloat(row.balance_payment) || 0,
                    alreadyrecivedamount: parseFloat(row.alreadyrecivedamount) || 0,
                    balancepaymentamount: parseFloat(row.balancepaymentamount) || 0
                }))
            };

            console.log("SPC Payload:", payload);
            const response = await GenerateSPC(payload);
            if (response && response.status) {
                toast.success("SPC generated successfully!");
                // Remove generated rows from the local state to make them vanish immediately
                setPayableData(prev => prev.filter(row => !selectedPayables.includes(row.IRNId || row.Id)));
                setSelectedPayables([]);
            } else {
                toast.error(response?.message || "Failed.");
            }
        } catch (error) {
            console.error("SPC Error:", error);
            toast.error("An error occurred.");
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="Accounts Payable (AP)" />

                {/* Filters */}
                <Card>
                    <CardBody>
                        <Row>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label className="fw-bold">Supplier</Label>
                                    <Select options={supplierList} value={filter.supplier} onChange={(opt) => handleFilterChange("supplier", opt)} isClearable placeholder="Select Supplier" />
                                    {activeTab === "2" && (
                                        <div className="mt-3 text-start" style={{ fontSize: "16px" }}>
                                            <span className="fw-bold me-2">Total AP:</span>
                                            <span className="text-primary fw-bold">
                                                {totalPayableValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label className="fw-bold">Currency</Label>
                                    <Select options={currencyList} value={filter.currency} onChange={(opt) => handleFilterChange("currency", opt)} isClearable placeholder="Select Currency" />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label className="fw-bold">From Date</Label>
                                    <Flatpickr className="form-control" value={filter.fromDate} onChange={(date) => handleFilterChange("fromDate", date[0])} options={{ dateFormat: "d-m-Y" }} />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label className="fw-bold">To Date</Label>
                                    <Flatpickr className="form-control" value={filter.toDate} onChange={(date) => handleFilterChange("toDate", date[0])} options={{ dateFormat: "d-m-Y" }} />
                                </div>
                            </Col>
                            <Col md={12} className="d-flex justify-content-end align-items-center gap-2">
                                <button type="button" className="btn btn-info btn-label" onClick={fetchData} disabled={loading}>
                                    <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search
                                </button>
                                <button type="button" className="btn btn-danger btn-label" onClick={handleClearFilter} disabled={loading}>
                                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i> Cancel
                                </button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* Grid */}
                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Nav tabs className="nav-tabs-custom mb-0 flex-grow-1 border-0">
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "1" })} onClick={() => toggleTab("1")} style={{ cursor: "pointer" }}>
                                        <span className="d-none d-sm-block">Accrued Purchases (GRN)</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "2" })} onClick={() => toggleTab("2")} style={{ cursor: "pointer" }}>
                                        <span className="d-none d-sm-block">Accounts Payable (IRN)</span>
                                    </NavLink>
                                </NavItem>
                            </Nav>

                            {activeTab === "2" && (
                                <div>
                                    <Button color="success" disabled={selectedPayables.length === 0} onClick={handleCreatePaymentClaim}>
                                        <i className="bx bx-check-double me-1"></i> Create Payment Claim
                                    </Button>
                                </div>
                            )}
                        </div>

                        <TabContent activeTab={activeTab} className="p-3 text-muted">
                            {/* GRN Tab */}
                            <TabPane tabId="1">
                                <DataTable
                                    value={accruedData}
                                    paginator
                                    rows={20}
                                    loading={loading}
                                    globalFilter={globalFilterAccrued}
                                    globalFilterFields={["Reference", "SupplierName", "CreatedBy"]}
                                    header={renderHeader(true)}
                                    responsiveLayout="scroll"
                                    emptyMessage="No Data Found"
                                    className="blue-bg"
                                    showGridlines
                                    size="small"
                                >
                                    <Column field="Reference" header="GRN No" body={(item) => (
                                        <span className="fw-bold cursor-pointer text-primary" style={{ textDecoration: 'underline' }} onClick={() => handleGRNClick(item.Id)}>
                                            {item.Reference}
                                        </span>
                                    )} sortable headerStyle={{ whiteSpace: 'nowrap' }} />
                                    <Column field="Date" header="GRN Date" body={(item) => formatDate(item.Date)} sortable headerStyle={{ whiteSpace: 'nowrap' }} />
                                    <Column field="SupplierName" header="Supplier" sortable />
                                    <Column field="CreatedDate" header="Created Date" body={(item) => formatDate(item.CreatedDate)} sortable headerStyle={{ whiteSpace: 'nowrap' }} />
                                    <Column field="CreatedBy" header="Created By" sortable />
                                </DataTable>
                            </TabPane>

                            {/* IRN Tab */}
                            <TabPane tabId="2">
                                <DataTable
                                    value={payableData}
                                    paginator
                                    rows={20}
                                    loading={loading}
                                    globalFilter={globalFilterPayable}
                                    globalFilterFields={["Reference", "SupplierName", "currencycode", "OriginalAmount", "PONumber"]}
                                    header={renderHeader(false)}
                                    responsiveLayout="scroll"
                                    emptyMessage="No Data Found"
                                    className="blue-bg"
                                    showGridlines
                                    size="small"
                                >
                                    <Column
                                        header={<Input type="checkbox" onChange={handleSelectAll} checked={payableData.length > 0 && selectedPayables.length === payableData.length} />}
                                        body={(item) => (
                                            <Input type="checkbox" checked={selectedPayables.includes(item.Id)} onChange={() => handleCheckboxChange(item.Id)} />
                                        )}
                                        headerStyle={{ width: "3%", minWidth: "3rem", textAlign: "center" }}
                                        bodyStyle={{ textAlign: "center" }}
                                    />
                                    <Column field="Reference" header="Reference (IRN)" body={(item) => (
                                        <span className="fw-bold cursor-pointer text-primary" style={{ textDecoration: 'underline' }} onClick={() => handleIRNClick(item.POId)}>
                                            {item.Reference}
                                        </span>
                                    )} sortable headerStyle={{ whiteSpace: 'nowrap' }} />
                                    <Column field="IRNDateObj" header="IRN Date" body={(item) => item.IRNDate} sortable headerStyle={{ whiteSpace: 'nowrap' }} />
                                    <Column field="POId" header="PO Number" body={displayPONumber} sortable />
                                    <Column field="currencycode" header="Currency" sortable />
                                    <Column field="DueDateObj" header="Due Date" body={(item) => formatDate(item.DueDate)} sortable headerStyle={{ whiteSpace: 'nowrap' }} />

                                    <Column field="OriginalAmount" header="Amount" body={(item) => (item.OriginalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="text-end" sortable />
                                    <Column field="CumulativeAmount" header="Cumulative Amount" body={(item) => (item.CumulativeAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="text-end" sortable />
                                </DataTable>
                            </TabPane>
                        </TabContent>
                    </CardBody>
                </Card>

                {/* --- DETAILS POPUP MODAL (Main) --- */}
                <Modal isOpen={modal} toggle={toggleModal} size="xl" centered>
                    <ModalHeader toggle={toggleModal}>
                        {modalType === "GRN" ? "GRN Details" : modalType === "IRN" ? "Invoice (IRN) Details" : "Purchase Order Details"}
                    </ModalHeader>
                    <ModalBody>
                        {modalLoading ? <div className="text-center p-5"><i className="bx bx-loader bx-spin font-size-24"></i></div> : modalData ? (
                            <>
                                {/* HEADER INFO SECTION - Structured with Proper Colon Alignment */}
                                <div className="mb-4">
                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>
                                                {modalType === "PO" ? "PO No." : "Number"}
                                            </span>
                                            <span style={{ color: "#333" }}>
                                                : {modalType === "GRN" ? modalData.Header?.grnno : modalData.Header?.pono}
                                            </span>
                                        </Col>
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>
                                                {modalType === "PO" ? "PO Date" : "Date"}
                                            </span>
                                            <span style={{ color: "#333" }}>
                                                : {formatDate(modalType === "GRN" ? modalData.Header?.grndate : modalData.Header?.podate)}
                                            </span>
                                        </Col>
                                    </Row>

                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>Supplier</span>
                                            <span style={{ color: "#333" }}>: {modalData.Header?.suppliername}</span>
                                        </Col>

                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>
                                                {modalType === "PO" ? "PR No." : "Total Amount"}
                                            </span>
                                            {modalType === "PO" ? (
                                                <span className="fw-bold text-danger cursor-pointer">
                                                    : {modalData.Requisition?.[0]?.prnumber || "-"}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#333" }}>
                                                    : {Number(modalData.Header?.nettotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </Col>
                                    </Row>

                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>Currency</span>
                                            <span style={{ color: "#333" }}>: {modalData.Header?.currencycode || "SGD"}</span>
                                        </Col>
                                    </Row>
                                </div>

                                {/* DETAILS TABLE */}
                                <div className="table-responsive border">
                                    <Table className="table table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                {(modalType === "PO" || modalType === "IRN") && <th>PR No.</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th>Item Group</th>}
                                                <th>{modalType === "GRN" ? "Item Description" : "Item Name"}</th>
                                                <th>Qty</th>
                                                <th>UOM</th>
                                                {modalType === "GRN" && <th>Recd Qty</th>}
                                                {modalType === "GRN" && <th>Bal Qty</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th className="text-end">Unit Price</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th className="text-end">Discount</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th className="text-end">Tax %</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th className="text-end">Tax Amt</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th className="text-end">VAT %</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th className="text-end">VAT Amt</th>}
                                                {(modalType === "PO" || modalType === "IRN") && <th className="text-end">Total Amt</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {((modalType === "GRN") ? modalData.Details : modalData.Requisition)?.map((row, i) => (
                                                <tr key={i} className="align-middle">
                                                    <td>{i + 1}</td>
                                                    {(modalType === "PO" || modalType === "IRN") && <td><span className="fw-bold text-danger cursor-pointer" onClick={() => handlePRClick(row.prid)}>{row.prnumber || row.pr_number || "-"}</span></td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td>{row.groupname || "-"}</td>}
                                                    <td>{row.itemname || row.itemDescription || "-"}</td>
                                                    <td>{row.qty || row.poqty || 0}</td>
                                                    <td>{row.uom || row.UOM || "-"}</td>
                                                    {modalType === "GRN" && <td>{row.alreadyrecqty || 0}</td>}
                                                    {modalType === "GRN" && <td>{row.balanceqty || 0}</td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td className="text-end">{Number(row.unitprice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td className="text-end">{Number(row.discountvalue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td className="text-end">{row.taxperc || 0}</td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td className="text-end">{Number(row.taxvalue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td className="text-end">{row.vatperc || 0}</td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td className="text-end">{Number(row.vatvalue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                                    {(modalType === "PO" || modalType === "IRN") && <td className="text-end"><strong>{Number(row.totalvalue || row.nettotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>}
                                                </tr>
                                            ))}
                                            {(modalType === "PO" || modalType === "IRN") && (
                                                <tr className="fw-bold bg-light">
                                                    <td colSpan={12} className="text-end">Total:</td>
                                                    <td className="text-end">{Number(modalData.Header?.nettotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </>
                        ) : <p className="text-center">No details available.</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={toggleModal}>Close</Button>
                    </ModalFooter>
                </Modal>

                {/* Nested PO Modal (Also Styled in Firebrick) */}
                <Modal isOpen={nestedModal} toggle={toggleNestedModal} size="xl" centered backdrop="static">
                    <ModalHeader toggle={toggleNestedModal}>Purchase Order Details (Linked)</ModalHeader>
                    <ModalBody>
                        {nestedPOLoading ? <div className="text-center p-5"><i className="bx bx-loader bx-spin font-size-24"></i></div> : nestedPOData ? (
                            <>
                                <div className="mb-4">
                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>PO No.</span>
                                            <span style={{ color: "#333" }}>: {nestedPOData.Header?.pono}</span>
                                        </Col>
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>PO Date</span>
                                            <span style={{ color: "#333" }}>: {formatDate(nestedPOData.Header?.podate)}</span>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>Supplier</span>
                                            <span style={{ color: "#333" }}>: {nestedPOData.Header?.suppliername}</span>
                                        </Col>
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>Status</span>
                                            <span style={{ color: "#333" }}>: {nestedPOData.Header?.isactive ? "Active" : "Inactive"}</span>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="table-responsive border">
                                    <Table className="table table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Item Name</th>
                                                <th>Qty</th>
                                                <th>UOM</th>
                                                <th className="text-end">Unit Price</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {nestedPOData.Requisition?.map((row, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{row.itemname}</td>
                                                    <td>{row.qty}</td>
                                                    <td>{row.uom}</td>
                                                    <td className="text-end">{Number(row.unitprice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="text-end">{Number(row.totalvalue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </>
                        ) : <p className="text-center">No data found.</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleNestedModal}>Close</Button>
                    </ModalFooter>
                </Modal>

                {/* PR Details Modal */}
                <Modal isOpen={prModal} toggle={togglePrModal} size="xl" centered backdrop="static">
                    <ModalHeader toggle={togglePrModal}>Purchase Requisition Details</ModalHeader>
                    <ModalBody>
                        {prLoading ? <div className="text-center p-5"><i className="bx bx-loader bx-spin font-size-24"></i></div> : prData ? (
                            <>
                                <div className="mb-4">
                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>PR No.</span>
                                            <span className="fw-bold text-danger cursor-pointer">: {prData.Header?.PR_Number}</span>
                                        </Col>
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>PR Date</span>
                                            <span style={{ color: "#333" }}>: {prData.Header?.PRDate}</span>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>Supplier</span>
                                            <span style={{ color: "#333" }}>: {prData.Header?.SupplierName}</span>
                                        </Col>
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>Currency</span>
                                            <span style={{ color: "#333" }}>: {prData.Header?.currencycode || "SGD"}</span>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2">
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>PR Type</span>
                                            <span style={{ color: "#333" }}>: {prData.Header?.prTypeName}</span>
                                        </Col>
                                        <Col md={6} className="d-flex">
                                            <span className="fw-bold" style={{ minWidth: "120px", color: "#333" }}>Payment Term</span>
                                            <span style={{ color: "#333" }}>: {prData.Header?.PaymentTermName}</span>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="table-responsive border">
                                    <Table className="table table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Item Group</th>
                                                <th>Item Name</th>
                                                <th>Qty</th>
                                                <th>UOM</th>
                                                <th className="text-end">Unit Price</th>
                                                <th className="text-end">Discount</th>
                                                <th className="text-end">Tax %</th>
                                                <th className="text-end">Tax Amt</th>
                                                <th className="text-end">VAT %</th>
                                                <th className="text-end">VAT Amt</th>
                                                <th className="text-end">Total Amt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prData.Details?.map((row, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{row.groupname}</td>
                                                    <td>{row.ItemName || "-"}</td>
                                                    <td>{row.Qty}</td>
                                                    <td>{row.UOMName}</td>
                                                    <td className="text-end">{Number(row.UnitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="text-end">{Number(row.DiscountValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="text-end">{row.TaxPerc}</td>
                                                    <td className="text-end">{Number(row.TaxValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="text-end">{row.vatPerc}</td>
                                                    <td className="text-end">{Number(row.vatValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="text-end"><strong>{Number(row.NetTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                                                </tr>
                                            ))}
                                            <tr className="fw-bold bg-light">
                                                <td colSpan={11} className="text-end">Total:</td>
                                                <td className="text-end">{Number(prData.Header?.HeaderNetValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </>
                        ) : <p className="text-center">No data found.</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={togglePrModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </div>
    );
};

export default AP;