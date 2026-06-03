
import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label, FormGroup, Input, InputGroup, ModalFooter } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Tooltip } from "primereact/tooltip";

import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useHistory } from "react-router-dom";
import Flatpickr from "react-flatpickr"
import Select from "react-select";
import { AutoComplete } from "primereact/autocomplete";
import { Badge } from 'primereact/badge';
import {
    GetClaimAndPaymentSupplierList, GetCommonProcurementUserDetails, GetPurchaseRequisitionList,
    GetPurchaseRequisitionSupplierList, GetPurchaseRequisitionUserDetails, GetCustomer, GetCommonProcurementPRType,
    GetByIdPurchaseRequisition,
    DownloadPurchaseRequisitionFileById,
    GetPurchaseMemoList,
    GetPurchaseRequisitionPRType,
    GetCommonProcurementProjectsDetails, GetSupplierSearchFilter, GetAllPO, GetByIdPurchaseOrder, GetPRNoBySupplierAndCurrency,
    GetPurchaseRequisitionRemarks,
    PurchaseRequisitionDownloadFileById,
    SavePRReply,
    GetApprovalSettings,
    CancelPurchaseRequisition
} from "common/data/mastersapi";
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).replace(/ /g, "-"); // convert spaces to hyphens
};
const getUserDetails = () => {
    if (localStorage.getItem("authUser")) {
        const obj = JSON.parse(localStorage.getItem("authUser"))
        return obj;
    }
}
// Move the initFilters function definition above
const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    PR_NUMBER: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    PRDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    PRType: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    SupplierName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    CreatedDateTime: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    CreatedByName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    Status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    NetAmount: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
});

const ProcurementManagePurchaseRequistion = () => {
    const history = useHistory();
    // Suppliers with added 'Active' property (for switch toggle)
    const initialSuppliers = [
        {
            PR_NUMBER: "",
            PRDate: "",
            RequestorName: "",
            //DepartmentName: "",
            SupplierName: "",
            NetAmount: 0,
            Status: "Saved",
            SQ_Nbr: "Action1",
            Active: true,
        },

    ];

    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [roledetails, setRoledetails] = useState([]);
    const [prTypes, setPrTypes] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters()); // Initialize with the filters
    const [statuses] = useState([
        { label: 'Saved', value: 'Saved' },
        { label: 'Posted', value: 'Posted' },
    ]);

    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
    const [selectedPR, setSelectedPR] = useState(null);
    const [userReply, setUserReply] = useState("");
    const [txtStatus, setTxtStatus] = useState(null);

    const [purchaseRequisition, setPurchaseRequisition] = useState([]);
    const [selectedFilterType, setSelectedFilterType] = useState(null);
    const [selectedAutoItem, setSelectedAutoItem] = useState(null);
    const [autoSuggestions, setAutoSuggestions] = useState([]);
    const [autoOptions, setAutoOptions] = useState([]);
    const [branchId, setBranchId] = useState(1);
    const [orgId, setOrgId] = useState(1);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState({});
    const [previewUrl, setPreviewUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [projects, setProjects] = useState([]);
    const [projectsReady, setProjectsReady] = useState(false);
    const [poDetailVisible, setPoDetailVisible] = useState(false);
    const [selectedPODetail, setSelectedPODetail] = useState(null);
    const [poOptions, setPoOptions] = useState([]); // ← Add this

    const userData = getUserDetails();
    const isRestrictedUser = [159, 160, 161, 163, 165].includes(userData?.u_id);

    const getSeverity = (Status) => {
        switch (Status) {
            case 'unqualified':
                return 'danger';
            case 'qualified':
                return 'success';
            case 'Posted':
                return 'success';
            case 'Cancelled':
            case 'Saved':
                return 'danger';
            case 'new':
                return 'info';
            case 'negotiation':
                return 'warning';
            case 'Yes':
                return 'success';
            case 'No':
                return 'danger';
            case 'renewal':
                return null;
        }
    };

    const FilterTypes = [
        { name: 'Supplier', value: 1 }, { name: 'PR Type', value: 2 }
    ];

    const [prTypeMap, setPrTypeMap] = useState({});

    useEffect(() => {
        const fetchPrTypes = async () => {
            try {
                const prTypeRes = await GetCommonProcurementPRType(0, orgId, branchId, '%');
                if (prTypeRes.status) {
                    const prTypeMap = {};
                    prTypeRes.data.forEach(item => {
                        prTypeMap[item.typeid] = item.typename;
                    });

                    setPrTypeMap(prTypeMap);
                }
            } catch (error) {
                console.error('Error fetching PR types:', error);
            }
        };

        fetchPrTypes();
    }, [0, orgId, branchId]);

    const [discussionHistory, setDiscussionHistory] = useState([]);

    // ADD THIS: Load all POs once so we can map PONO → poid
    // useEffect(() => {
    //     const loadAllPOs = async () => {
    //         try {
    //             const res = await GetAllPO(branchId, orgId);
    //             if (res?.status && Array.isArray(res.data)) {
    //                 const options = res.data.map(po => ({
    //                     value: po.pono,
    //                     label: po.pono,
    //                     poid: po.poid
    //                 }));
    //                 // setPoOptions(options);
    //             }
    //         } catch (err) {
    //             console.error("Failed to load POs for PONO link", err);
    //         }
    //     };
    //     loadAllPOs();
    // }, [branchId, orgId]);

    // GLOBAL LOAD (runs once)
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await GetCommonProcurementProjectsDetails(orgId, branchId, '%');
                if (res.status && Array.isArray(res.data)) {
                    const opts = res.data.map(item => ({
                        value: Number(item.value),   // ALWAYS number
                        label: String(item.label)
                    }));
                    setProjects(opts);
                }
            } catch (e) {
                console.error('Global project load error', e);
            } finally {
                setProjectsReady(true);
            }
        };
        loadProjects();
    }, [orgId, branchId]);


    const fetchAllProcurementRequestion = async () => {
        const userData = getUserDetails();

        const res = await GetPurchaseRequisitionList(0, 0, orgId, branchId, userData?.u_id);
        if (res.status) {
            setPurchaseRequisition(res.data);
        }
        // } else {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Initial Load Failed',
        //         text: res.message || 'Unable to fetch default claim and payment data.',
        //     });
        // }
    };

    useEffect(() => {
        fetchAllProcurementRequestion();
    }, []);

    useEffect(() => {
        const customerData = getCustomers();
        const initialSwitchStates = {};
        customerData.forEach(customer => {
            initialSwitchStates[customer.Code] = customer.Active === 1;
        });
        setSwitchStates(initialSwitchStates);
    }, []);

    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const toggleModal2 = () => {
        setIsModalOpen2(!isModalOpen2);
    };

    const getCustomers = () => {

        //const customerData = await GetCustomer(1,0);
        return [
            { Code: "SUP000491", Name: "PT HALO HALO BANDUNG", Country: "Indonesia", Contactperson: "Muthu" },
            { Code: "SUP000500", Name: "RAVIKUMAR", Country: "China", Contactperson: "Kevin" },
            { Code: "SUP000492", Name: "SASIKALA", Country: "Indonesia", Contactperson: "Mark" },
            { Code: "SUP000498", Name: "Jane", Country: "Indonesia", Contactperson: "Sophia" },
        ];
    };

    const clearFilter = () => {
        setSelectedFilterType(null);
        setSelectedAutoItem(null);
        setFilters(initFilters()); // Reset the filters state
        setGlobalFilterValue(''); // Clear the global filter value
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { ...prevFilters.global, value },
        }));
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="row align-items-center g-3 clear-spa">
                <div className="col-12 col-lg-2">
                    <Button className="btn btn-danger btn-label" onClick={clearFilter}>
                        <i className="mdi mdi-filter-off label-icon" /> Clear
                    </Button>
                </div>

                <div className="col-12 col-lg-8 text-end">
                    <Badge style={{ width: "5px", fontSize: "13px", margin: "3px" }} value={"A"} severity={"success"} /><b> Approved </b>
                    <Badge style={{ width: "5px", fontSize: "13px", margin: "3px" }} value={"D"} severity={"warning"} /> <b> Discussed  </b>
                    <Badge style={{ width: "5px", fontSize: "13px", margin: "3px" }} value={"P"} severity={"danger"} /> <b> Pending  </b>
                    <span className="ms-4 me-3">
                        <Tag value="S" severity="danger" /> Saved
                    </span>
                    <span className="me-3">
                        <Tag value="P" severity="success" /> Posted
                    </span>
                    <span className="me-3">
                        <Tag value="C" style={{ backgroundColor: '#ffe6e6', color: '#b30000', border: '1px solid #ffb3b3' }} /> Cancelled
                    </span>
                </div>
                <div className="col-12 col-lg-2">
                    <input
                        className="form-control"
                        type="text"
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Keyword Search"
                    />
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const filterClearTemplate = (options) => {
        return <Button type="button" icon="pi pi-times" onClick={options.filterClearCallback} severity="secondary"></Button>;
    };

    const filterApplyTemplate = (options) => {
        return <Button type="button" icon="pi pi-check" onClick={options.filterApplyCallback} severity="success"></Button>;
    };

    const filterFooterTemplate = () => {
        return <div className="px-3 pt-0 pb-3 text-center">Filter by Country</div>;
    };

    const linkAddPurchaseRequisition = () => {
        history.push("/procurementsadd-purchaserequisition");
    };

    const editRow = (rowData) => {
        history.push({
            pathname: "/procurementsadd-purchaserequisition", state: { ReqDetails: rowData }
        });
    };

    const handleCancelPR = (rowData) => {
        Swal.fire({
            title: "Are you sure?",
            text: `This will cancel Purchase Requisition ${rowData.PR_NUMBER} and reset the PM approval status.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, cancel it!",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const payload = {
                        prid: rowData.PRId,
                        userId: Number(userData?.u_id),
                        branchId: branchId,
                        orgId: orgId
                    };
                    const res = await CancelPurchaseRequisition(payload);
                    if (res?.status) {
                        Swal.fire("Cancelled!", res.message || "Purchase Requisition has been cancelled.", "success");
                        fetchAllProcurementRequestion(); // Refresh the list
                    } else {
                        Swal.fire("Error", res?.message || "Failed to cancel Purchase Requisition.", "error");
                    }
                } catch (error) {
                    console.error("Error cancelling PR:", error);
                    Swal.fire("Error", "Something went wrong while cancelling.", "error");
                }
            }
        });
    };

    const cancelBodyTemplate = (rowData) => {
        // Only visible to Hugo (UserId: 135)
        if (Number(userData?.u_id) !== 135) {
            return null;
        }

        const isEligible = rowData.reqdmstatus === 'P' &&
            rowData.reqdrtatus === 'P' &&
            rowData.ApproveStatus === 'No' &&
            rowData.IsCancel !== 1;

        return (
            <div className="d-flex align-items-center justify-content-center">
                <span
                    onClick={() => {
                        if (isEligible) {
                            handleCancelPR(rowData);
                        }
                    }}
                    title={isEligible ? "Cancel PR" : "Cancellation not allowed"}
                    style={{
                        cursor: isEligible ? 'pointer' : 'not-allowed',
                        color: isEligible ? '#d9534f' : '#ccc',
                        opacity: isEligible ? 1 : 0.5,
                        display: 'inline-block'
                    }}
                >
                    <i className="mdi mdi-delete-outline" style={{ fontSize: '1.5rem' }}></i>
                </span>
            </div>
        );
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex align-items-center justify-content-center gap-3">
                {(!isRestrictedUser && rowData.IsActive === 1 && rowData.Status === 'Saved') || Number(userData?.u_id) === 133 ? (
                    <span onClick={() => editRow(rowData)}
                        title='Edit' style={{ cursor: 'pointer' }}>
                        <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                    </span>) : (
                    <span title="">
                        <i className="mdi mdi-square-edit-outline"
                            style={{ fontSize: '1.5rem', color: 'gray', opacity: 0.5 }}>
                        </i>
                    </span>
                )}

            </div>
        );
    };


    const onSwitchChange = () => {
        if (!selectedRow) return;

        const newStatus = !switchStates[selectedRow.Code];
        setSwitchStates(prevStates => ({
            ...prevStates,
            [selectedRow.Code]: newStatus,
        }));

        setCustomers(prevCustomers =>
            prevCustomers.map(customer =>
                customer.Code === selectedRow.Code ? { ...customer, Active: newStatus ? 1 : 0 } : customer
            )
        );
        // console.log(`Customer ${selectedRow.Code} Active Status:`, newStatus ? 1 : 0);
        setIsModalOpen(false);
    };

    const openModal = (rowData) => {
        const value = rowData.IsActive == 1 ? "deactive" : "active";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };

    const openDiscussionModal = async (prData) => {
        setSelectedPR(prData);
        setUserReply("");
        setDiscussionHistory([]); // Clear previous history

        try {
            const res = await GetPurchaseRequisitionRemarks(prData.PRId);
            console.log("Discussion history fetched:", res);
            if (Array.isArray(res) && res.length > 0) {
                setDiscussionHistory(res);
            } else {
                setDiscussionHistory([]);
            }
        } catch (err) {
            console.error("Failed to load remarks", err);
            setDiscussionHistory([]);
        }

        setDiscussionModalOpen(true);
    };

    const handleSendReply = async () => {
        if (!userReply.trim()) {
            Swal.fire("Error", "Please enter a reply", "error");
            return;
        }
        const userData = getUserDetails();
        const sender = userData.role === "GM" ? "GM" : "User";
        // Ensure accurate display name if needed, but sender handles logic
        const displayName = sender === "GM" ? "GM" : userData.username;

        const res = await SavePRReply(selectedPR.PRId, userReply, displayName, sender);

        if (res.success) {
            Swal.fire("Success", "Reply sent successfully", "success");
            setUserReply("");

            // 1. Fetch updated history
            const updatedRemarks = await GetPurchaseRequisitionRemarks(selectedPR.PRId);

            let newFullComment = userReply;
            if (Array.isArray(updatedRemarks) && updatedRemarks.length > 0) {
                const sorted = [...updatedRemarks].sort((a, b) => new Date(a.logdate) - new Date(b.logdate));
                setDiscussionHistory(sorted);
                newFullComment = sorted[sorted.length - 1].pr_comment;
            } else {
                setDiscussionHistory([]);
            }

            // 2. Update selectedPR to pass Valid Chain Check
            setSelectedPR(prev => ({ ...prev, pr_comment: newFullComment }));

            // 3. Immediately update the main list state (Status -> Posted) without reload
            setPurchaseRequisition(prev => prev.map(item =>
                item.PRId === selectedPR.PRId ? { ...item, Status: 'Posted' } : item
            ));

            // Update main list in background if needed
            fetchAllProcurementRequestion();
            // Do NOT close modal
            // setDiscussionModalOpen(false);
        } else {
            Swal.fire("Error", res.message || "Failed to save reply", "error");
        }
    };
    const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="square-switch">
                <Input
                    type="checkbox"
                    id={`square-switch-${rowData.PRId}`}
                    switch="bool"
                    onChange={() => openModal(rowData)}
                    checked={switchStates[rowData.PRId] ?? rowData.IsActive === 1}
                />
                <label htmlFor={`square-switch-${rowData.PRId}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        const statusShort = rowData.Status === "Saved" ? "S" : rowData.Status === "Posted" ? "P" : rowData.Status;
        return <Tag value={statusShort} severity={getSeverity(rowData.Status)} />;
    };

    const statusFilterTemplate = (options) => {
        return <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterCallback(e.value, options.index)}
            itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" showClear />;
    };

    const statusItemTemplate = (option) => {
        return <Tag value={option.label} severity={getSeverity(option.value)} />;
    };

    const searchData = async () => {
        const filterType = selectedFilterType?.value || 0;
        const filterValue = selectedAutoItem?.value || 0;

        const userData = getUserDetails();

        const res = await GetPurchaseRequisitionList(filterType, filterValue, orgId, branchId, userData?.u_id);
        if (res.status) {
            setPurchaseRequisition(res.data);
        }
    };

    const cancelFilter = async () => {
        setSelectedFilterType(null);
        setSelectedAutoItem(null);
        const userData = getUserDetails();

        const res = await GetPurchaseRequisitionList(0, 0, orgId, branchId, userData?.u_id);
        if (res.status) {
            setPurchaseRequisition(res.data);
        }
    };

    const exportToExcel = () => {
        // console.log('purchaseRequisition > ',purchaseRequisition);
        // console.log('prTypeMap > ',prTypeMap);
        // return;
        // const filteredQuotes = salesOrder.map(({ IsPosted, ...rest }) => rest);
        const exportData = purchaseRequisition.map((item) => ({
            "PR No.": item.PR_NUMBER ?? '',
            "PR Date": item.PRDate ?? '',
            "PR Type": prTypeMap[String(item.PRType)] ?? 'N/A',
            "Supplier": item.SupplierName ?? '',
            "Total Amount": item.NetAmount ?? '',
            "Created By": item.CreatedByName ?? '',
            "Memo ramarks": item.Memoremarks ?? '',
            "Status": item.Status ?? '',

            "GM": item.reqdmstatus ?? '',
            "Director": item.reqdrtatus ?? '',
            "PO Generated": item.ApproveStatus ?? '',

        }));



        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Returns");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const now = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(now.getDate()).padStart(2, "0");
        const month = months[now.getMonth()];
        const year = now.getFullYear();

        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12 || 12;

        const timeStr = `${hours}:${minutes}${ampm}`;
        const fileName = `BTG-PurchaseRequisition-${day}${month}${year}-${timeStr}.xlsx`;

        saveAs(data, fileName);
    };

    // Load AutoComplete Suggestions
    const loadSuggestions = async (e) => {
        const query = e.query?.trim() || "%";
        let result = [];

        if (selectedFilterType?.value === 1) {
            // Supplier
            result = await GetPurchaseRequisitionSupplierList(orgId, branchId, query);
            const formatted = (Array.isArray(result.data) ? result.data : []).map(item => ({
                label: item.SupplierName,
                value: item.SupplierId,
            }));
            setAutoSuggestions(formatted);
        } else if (selectedFilterType?.value === 2) {
            // Requestor
            result = await GetPurchaseRequisitionPRType(orgId, branchId, query);
            const formatted = (Array.isArray(result.data) ? result.data : []).map(item => ({
                label: item.prtypeid,
                value: item.prtypeid,
            }));
            setAutoSuggestions(formatted);
        } else {
            setAutoSuggestions([]);
        }
    };

    // Get Label
    const getDynamicLabel = () => {
        if (selectedFilterType?.value === 1) return "Supplier";
        if (selectedFilterType?.value === 2) return "PR Type";
        return "";
    };

    useEffect(() => {
        const loadOptions = async () => {
            if (!selectedFilterType) {
                setAutoOptions([]);
                return;
            }

            let result = [];
            if (selectedFilterType.value === 1) {
                // Supplier
                result = await GetSupplierSearchFilter(orgId, branchId, "%");
                setAutoOptions(
                    (result?.data || []).map(item => ({
                        label: item.SupplierName,
                        value: item.SupplierID,
                    }))
                );
            } else if (selectedFilterType.value === 2) {
                // Requestor
                result = await GetPurchaseRequisitionPRType(orgId, branchId, "%");
                setAutoOptions(
                    (result?.data || []).map(item => ({
                        label: item.prtype,
                        value: item.prtypeid,
                    }))
                );
            } else {
                setAutoOptions([]);
            }
        };

        loadOptions();
        loadOptions();
    }, [selectedFilterType, orgId, branchId]);

    useEffect(() => {
        const fetchRoleDetails = async () => {
            const userData = getUserDetails();
            if (userData) {
                const res = await GetApprovalSettings(userData.u_id, orgId, branchId, 27);
                if (res.status) {
                    setRoledetails(res.data);
                }
            }
        }
        fetchRoleDetails();
    }, [orgId, branchId]);

    const requisitionWithLabels = purchaseRequisition.map(item => ({
        ...item,
        PRTypeLabel: prTypeMap[item.PRType] || 'N/A'
    }));

    // const handleShowDetails = async (row) => {
    //     const memoList = await GetPurchaseMemoList(row.PRId, branchId, orgId, '%');
    //     const res = await GetByIdPurchaseRequisition(row.PRId, 1, 1);

    //     if (res.status) {
    //         let details = res.data.Details || [];

    //         if (memoList?.data?.length > 0) {
    //         details = details.map((d) => {
    //             const memo = memoList?.data?.find((m) => m.memo_id === d.MEMO_ID);
    //             return {
    //             ...d,
    //             memo_number: memo ? memo.pm_number : "NA",
    //             MemoDisplay: memo ? memo.pm_number : "NA",
    //             };
    //         });
    //         } else {
    //         details = details.map((d) => ({
    //             ...d,
    //             memo_number: "NA",
    //             MemoDisplay: "NA",
    //         }));
    //         }

    //         let headerMemoNumbers = [
    //         ...new Set(details.map((d) => d.memo_number).filter(Boolean)),
    //         ].join(", ");

    //         if (!headerMemoNumbers) headerMemoNumbers = "NA";

    //         setSelectedDetail({
    //             ...res.data,
    //             Header: {
    //                 ...res.data.Header,
    //                 MemoConcat: headerMemoNumbers, // set header field
    //             },
    //             Details: details,
    //         });

    //         setDetailVisible(true);

    //         setPreviewUrl(
    //             res.data.Header.filepath ? res.data.Header.filepath : ""
    //         );
    //         setFileName(
    //             res.data.Header.filepath ? res.data.Header.filepath : ""
    //         );
    //     } else {
    //         Swal.fire("Error", "Data is not available", "error");
    //     }
    // };

    // Assuming this runs after fetching PR or PO data
    const setPOOptionsFromResponse = (response) => {
        if (response?.status && response?.data?.Header) {
            const header = response.data.Header;
            const newOption = {
                value: header.pono,   // string PO number
                label: header.pono,
                poid: header.poid      // numeric ID
            };

            setPoOptions(prev => {
                const exists = prev.find(p => p.poid === newOption.poid);
                if (exists) return prev;
                return [...prev, newOption];
            });
        }
    };


    const handleShowDetails = async (row) => {
        const res = await GetByIdPurchaseRequisition(row.PRId, 1, 1);

        if (res.status) {
            let details = res.data.Details || [];
            setPOOptionsFromResponse(res);

            // Add MemoDisplay column from PM_Number directly
            details = details.map((d) => ({
                ...d,
                memo_number: d.PM_Number || "NA",
                MemoDisplay: d.PM_Number || "NA",
            }));

            // Collect unique memo numbers for header
            let headerMemoNumbers = [
                ...new Set(details.map((d) => d.PM_Number).filter(Boolean))
            ].join(", ");

            if (!headerMemoNumbers) headerMemoNumbers = "NA";

            // Get Project Name
            const projectId = Number(res.data.Header?.projectId);   // force number
            const projectObj = projects.find(p => p.value === projectId);
            const projectName = projectObj ? projectObj.label : 'N/A';

            setSelectedDetail({
                ...res.data,
                Header: {
                    ...res.data.Header,
                    MemoConcat: headerMemoNumbers,
                    ProjectName: projectName, // Add project name
                },
                Details: details,
            });

            setDetailVisible(true);

            setPreviewUrl(res.data.Header.filepath || "");
            setFileName(res.data.Header.filepath || "");
        } else {
            Swal.fire("Error", "Data is not available", "error");
        }
    };


    const actionclaimBodyTemplate = (rowData) => {
        return <span style={{ cursor: "pointer", color: "blue" }} className="btn-rounded btn btn-link"
            onClick={() => handleShowDetails(rowData)}>{rowData.PR_NUMBER}</span>;
    };

    const handleDownloadFile = async (data) => {
        const fileId = data.prid ? data.prid : 0;

        const filepath = data.filepath ? data.filepath : "";
        const filename = data.filename ? data.filename : "";

        // concat path + filename
        const fullPath = filepath && filename ? `${filepath}/${filename}` : "";

        if (!fullPath) {
            Swal.fire("Error", "File path or name missing", "error");
            return;
        }

        const fileUrl = await DownloadPurchaseRequisitionFileById(fileId, fullPath);

    };

    const actionMemoBodyTemplate = (rowData) => {
        return <span style={{ cursor: "pointer", color: "blue" }} className="btn-rounded btn btn-link"
            onClick={() => handleDownloadFile(rowData)}>{rowData.filename}</span>;
    };

    const statusBodyTemplate1 = (data) => {
        return (
            <Tag
                value={data.ApproveStatus}
                severity={getSeverity(data.ApproveStatus)}
                rounded
            />
        );
    };


    const ApproverGridIndicator = ({ approved, PRId, comment, isDirectorField }) => {
        let severity = 'secondary'; // default gray
        if (approved === "A") severity = 'success';
        else if (approved === "D") severity = 'warning';
        else severity = 'danger';

        console.log("ApproverGridIndicator Props:", { approved, PRId, comment, isDirectorField });

        if (approved === "D") {
            // If Director Field and status is Discussed, show badge ONLY (no chat modal)
            if (isDirectorField) {
                return (
                    <Badge
                        value={approved}
                        severity={severity}
                        style={{ fontSize: '13px', margin: '0' }}
                    />
                );
            }

            return (
                <>
                    <Tooltip target={`.badge-${PRId}`} content={`Discussion comment : ${comment}`} position="top" />
                    <Badge
                        className={`badge-${PRId}`}
                        value={approved}
                        severity={severity}
                        style={{ fontSize: '13px', margin: '0', cursor: 'pointer' }}
                        onClick={() => {
                            if (PRId) {
                                openDiscussionModal({ PRId, comment });
                            } else {
                                console.error("PRId is undefined!");
                            }
                        }}
                    />
                </>
            );
        } else {
            return (
                <>

                    <Badge

                        value={approved}
                        severity={severity}
                        style={{ fontSize: '13px', margin: '0' }}
                    />
                </>)
        }

    };

    const CopyClaim = (rowData) => {
        // history.push(`/copy-claim&payment/${rowData.Claim_ID}`);
        history.push({
            pathname: "/procurementscopy-purchaserequisition", state: { ReqDetails: rowData }
        });
    };

    const CopyBodyTemplate = (rowData) => {
        return (
            <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                <span
                    onClick={() => CopyClaim(rowData)}
                    title="Copy"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <i className="mdi mdi-content-copy" style={{ fontSize: '1.5rem' }}></i>
                </span>

            </div>
        );
    };

    const handlePonoClick = async (pono) => {
        if (!pono || pono === "NA" || !String(pono).trim()) {
            Swal.fire("Info", "No PO Reference available", "info");
            return;
        }

        const cleanPono = String(pono).trim();

        // Find poid from poOptions (already loaded)
        const poOption = poOptions.find(opt =>
            String(opt.value).trim() === cleanPono
        );

        if (!poOption?.poid) {
            Swal.fire({
                icon: "warning",
                title: "PO Not Found",
                text: `Cannot open PO "${cleanPono}". It may not be loaded yet or doesn't exist.`,
                footer: "Try refreshing the page."
            });
            return;
        }

        try {
            // DO NOT close PR modal → just open PO modal on top
            const res = await GetByIdPurchaseOrder(poOption.poid, orgId, branchId);

            if (res?.status) {
                const supplier_id = res.data?.Header?.supplierid;
                const currency_id = res.data?.Header?.currencyid;
                const prList = await GetPRNoBySupplierAndCurrency(supplier_id, currency_id, orgId, branchId);

                let requisition = res.data.Requisition || [];
                if (prList?.data?.length > 0) {
                    requisition = requisition.map(r => {
                        const pr = prList.data.find(p => p.prid === r.prid);
                        return { ...r, prnumber: pr ? pr.pr_number : "NA" };
                    });
                }

                const headerPRNumbers = [...new Set(requisition.map(r => r.prnumber).filter(Boolean))].join(", ") || "NA";

                setSelectedPODetail({
                    ...res.data,
                    Header: {
                        ...res.data.Header,
                        PRConcat: headerPRNumbers
                    },
                    Requisition: requisition
                });

                setPoDetailVisible(true); // Only open PO modal
            } else {
                Swal.fire("Error", "PO details not available", "error");
            }
        } catch (err) {
            console.error("Failed to load PO:", err);
            Swal.fire("Error", "Could not load Purchase Order", "error");
        }
    };

    return (
        <React.Fragment>
            <style>{`
                .cancelled-row, .cancelled-row td {
                    background-color: #ffe6e6 !important;
                    color: #b30000 !important;
                }
            `}</style>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Procurement" breadcrumbItem="Purchase Requisition" />
                    <Row>
                        <Card className="search-top">


                            <div className="row align-items-end g-3 quotation-mid p-3">
                                {/* User Name */}
                                <div className="col-12 col-lg-3 mt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="Search_Type" className="form-label mb-0">Search By</label></div>
                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                                            <Select
                                                name="filtertype"
                                                options={FilterTypes.map(f => ({ label: f.name, value: f.value }))}
                                                placeholder="Select Filter Type"
                                                classNamePrefix="select"
                                                isClearable
                                                value={selectedFilterType}
                                                onChange={(selected) => {
                                                    setSelectedFilterType(selected);
                                                    setSelectedAutoItem(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedFilterType && (
                                    <div className="col-12 col-lg-4 mt-1">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                                                <label className="form-label mb-0">{getDynamicLabel()}</label>
                                            </div>
                                            <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                                                {/* <AutoComplete
                                                    value={selectedAutoItem}
                                                    suggestions={autoSuggestions}
                                                    completeMethod={loadSuggestions}
                                                    field="label"
                                                    onChange={(e) => setSelectedAutoItem(e.value)}
                                                    placeholder={`Search ${getDynamicLabel()}`}
                                                    style={{ width: "100%" }}
                                                    className={`my-autocomplete`}
                                                /> */}
                                                <Select
                                                    name="dynamicSelect"
                                                    options={autoOptions}
                                                    placeholder={`Search ${selectedFilterType.label}`}
                                                    classNamePrefix="select"
                                                    isClearable
                                                    isSearchable
                                                    value={selectedAutoItem}
                                                    onChange={(selected) => setSelectedAutoItem(selected)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}



                                <div className={`col-12 ${selectedFilterType ? 'col-lg-5' : 'col-lg-9'} d-flex justify-content-end flex-wrap gap-2`} >
                                    <button type="button" className="btn btn-info" onClick={searchData}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={cancelFilter}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                    <button type="button" className="btn btn-secondary" onClick={exportToExcel}> <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Export</button>
                                    {!isRestrictedUser && (
                                        <button type="button" className="btn btn-success" onClick={linkAddPurchaseRequisition}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable
                                    value={requisitionWithLabels}
                                    rowClassName={(data) => data.IsCancel === 1 ? 'cancelled-row' : ''}
                                    paginator
                                    showGridlines
                                    rows={20}
                                    loading={loading}
                                    dataKey="PRId"
                                    filters={filters}
                                    globalFilterFields={['NetAmount', 'ApproveStatus', 'PR_NUMBER', 'PRDate', 'PRTypeLabel', 'SupplierName', 'CreatedDateTime', 'CreatedByName', 'Status']}
                                    emptyMessage="No Requisition found."
                                    header={header}
                                    onFilter={(e) => setFilters(e.filters)}   // lowercase "filters", not "Filters"
                                    className="blue-bg"
                                >
                                    <Column
                                        field="PR_NUMBER"
                                        sortable
                                        header="PR No"
                                        filter
                                        filterPlaceholder="Search by PR NO"
                                        className="text-left"
                                        // style={{ width: "10%" }}
                                        body={actionclaimBodyTemplate}
                                    />
                                    <Column
                                        field="PRDate"
                                        header="PR Date"
                                        filter
                                        filterPlaceholder="Search by PR Date"
                                        className="text-center"
                                        style={{ width: "10%" }}
                                    />
                                    <Column
                                        field="PRType"
                                        sortField="PRTypeLabel"
                                        header="PR Type"
                                        body={(rowData) => prTypeMap[rowData.PRType] || 'N/A'}
                                        sortable
                                        filter
                                        filterElement={(options) => (
                                            <Dropdown
                                                value={options.value}
                                                options={Object.entries(prTypeMap).map(([key, val]) => ({
                                                    label: val,
                                                    value: key
                                                }))}
                                                onChange={(e) => options.filterApplyCallback(e.value)}
                                                placeholder="Select PR Type"
                                                className="p-column-filter"
                                                showClear
                                            />
                                        )}
                                    // className="text-center"
                                    />

                                    {/* <Column
                                        field="DepartmentName"
                                        header="Department"
                                        filter
                                        filterPlaceholder="Search by Department"
                                        className="text-center"
                                    />*/}
                                    <Column
                                        field="SupplierName"
                                        header="Supplier"
                                        sortable
                                        filter
                                        filterPlaceholder="Search by Supplier"
                                        className="text-left"
                                    />
                                    {/* <Column
                                        field="CreatedDateTime"
                                        header="Created Date"
                                        filter
                                        filterPlaceholder="Search by created date"
                                        className="text-left"
                                    /> */}
                                    <Column
                                        field="NetAmount"
                                        header="Total Amount"
                                        filter
                                        filterPlaceholder="Search by total amount"
                                        className="text-right"
                                        style={{ textAlign: "right" }}
                                        body={(rowData) =>
                                            rowData.NetAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })
                                        }
                                    />
                                    <Column
                                        field="CreatedByName"
                                        header="Created By"
                                        filter
                                        filterPlaceholder="Search by created by"
                                        className="text-left"
                                    />
                                    {/* <Column
                                        field="NetAmount"
                                        header="Total Amount"
                                        filter
                                        className="text-lg-end"
                                        filterPlaceholder="Search by TotalAmt"
                                        style={{ width: "15%" }}
                                    /> */}

                                    <Column
                                        field="Status"
                                        header="Status"
                                        filterMenuStyle={{ width: '14rem' }}
                                        body={statusBodyTemplate}
                                        filter filterElement={statusFilterTemplate}
                                        className="text-center"
                                    />
                                    <Column
                                        className="text-center"
                                        style={{ width: "5%" }}
                                        header="GM"
                                        body={(r) => {
                                            let status = r.reqdmstatus;

                                            // FIX: If Director status is D or A, GM status must be A, unless GM is explicitly discussing (Status D).
                                            // This prevents GM status appearing as 'P' when Director is discussing with GM.
                                            if ((r.reqdrtatus === 'D' || r.reqdrtatus === 'A') && status === 'P') {
                                                status = 'A';
                                            }

                                            return <ApproverGridIndicator approved={status}
                                                PRId={r.PRId}
                                                comment={r.pr_comment}
                                            />
                                        }} />
                                    <Column
                                        className="text-center"
                                        style={{ width: "5%" }}
                                        header="Director"
                                        body={(r) => <ApproverGridIndicator

                                            approved={r.reqdrtatus}
                                            PRId={r.PRId}
                                            comment={r.pr_comment}
                                            isDirectorField={true}
                                        />}

                                    />

                                    <Column field="ApproveStatus" header="PO Generated" sortable body={statusBodyTemplate1} filter className="text-center" />

                                    {/*<Column
                                        header="Active"
                                        body={actionBodyTemplate2}
                                        className="text-center"
                                        style={{ width: "10%" }}
                                    />*/}
                                    <Column
                                        header="Action"
                                        showFilterMatchModes={false}
                                        body={actionBodyTemplate}
                                        className="text-center"
                                        style={{ width: "8%" }}
                                    />
                                    {Number(userData?.u_id) === 135 && (
                                        <Column
                                            header="Delete"
                                            showFilterMatchModes={false}
                                            body={cancelBodyTemplate}
                                            className="text-center"
                                            style={{ width: "5%" }}
                                        />
                                    )}
                                    <Column header="Copy" showFilterMatchModes={false} body={CopyBodyTemplate} className="text-center" />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                <h4>Do you want to {txtStatus} this account?</h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button className="btn btn-info" color="success" size="lg" onClick={onSwitchChange}>
                                    Yes
                                </Button>
                                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
            <Modal isOpen={detailVisible} toggle={() => setDetailVisible(false)} size="xl">
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '15px', right: '50px', fontWeight: 'bold', color: '#333', fontSize: '12px', zIndex: 10 }}>F-BTG-PUR-03 (Rev.03)</span>
                    <ModalHeader toggle={() => setDetailVisible(false)}>
                        PR Details
                    </ModalHeader>
                </div>
                <ModalBody>
                    {selectedDetail && (
                        <>
                            {/* Header Section */}
                            <Row form>
                                {[
                                    ["PR No.", selectedDetail.Header?.PR_Number],
                                    ["PR Type", selectedDetail.Header?.prTypeName],
                                    ["PR Date", selectedDetail.Header?.PRDate],
                                    ["PM No.", selectedDetail.Header?.MemoConcat],
                                    ["Supplier", selectedDetail.Header?.SupplierName],
                                    ["Currency", selectedDetail.Header?.currencycode],
                                    ["Payment Term", selectedDetail.Header?.PaymentTermName],
                                    ["Sup. Address", selectedDetail.Header?.SupplierAddress],
                                    ["Delivery Term", selectedDetail.Header?.DeliveryTerm],
                                    ["Requestor", selectedDetail.Header?.UserName],
                                    ["BTG Delivery Address", selectedDetail.Header?.BTGDeliveryAddress],
                                    ["Sup. Contact", selectedDetail.Header?.contact],
                                    ["Sup. Email", selectedDetail.Header?.Email],
                                    ["Projects", selectedDetail.Header?.ProjectName],
                                    ["PO Reference", selectedDetail.Header?.poreference],
                                ].map(([label, val], i) => (
                                    // <Col md="4" key={i} className="form-group row">
                                    //     <Label className="col-sm-5 col-form-label bold">{label}</Label>
                                    //     <Col sm="7" className="mt-2" style={{ wordWrap: "break-word" }}>
                                    //         :{" "}
                                    //         {(label === "Supplier" || label === "Currency") ? (
                                    //             <b>{val}</b>
                                    //         ) : (
                                    //             val
                                    //         )}
                                    //     </Col>
                                    // </Col>
                                    <Col md="4" key={i} className="form-group row">
                                        <Label className="col-sm-5 col-form-label bold">{label}</Label>

                                        <Col sm="7" className="mt-2" style={{ wordWrap: "break-word" }}>
                                            :{" "}

                                            {/* Make PONO clickable */}
                                            {label === "PO Reference" ? (
                                                <a
                                                    onClick={() => handlePonoClick(val)}
                                                    style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
                                                >
                                                    {val || "N/A"}
                                                </a>
                                            ) : (label === "Supplier") ? (
                                                <b>{val}</b>
                                            )
                                                : (label === "Currency") ? (
                                                    <b style={{ color: "green" }}>{val}</b>
                                                )

                                                    : (
                                                        val
                                                    )}
                                        </Col>
                                    </Col>
                                ))}
                            </Row>

                            <hr />

                            <DataTable value={selectedDetail.Details} footerColumnGroup={
                                <ColumnGroup>
                                    <Row>
                                        <Column footer="GRAND TOTAL" colSpan={6} footerStyle={{ textAlign: 'right', fontWeight: 'bold' }} />


                                        <Column
                                            footer={<b>{selectedDetail.Header?.HeaderDiscountValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>}
                                        />
                                        <Column footerStyle={{ textAlign: 'right', fontWeight: 'bold' }} />
                                        <Column footerStyle={{ textAlign: 'right', fontWeight: 'bold' }} />
                                        <Column
                                            footer={<b>{selectedDetail.Header?.HeaderTaxValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>}
                                        />
                                        <Column footerStyle={{ textAlign: 'right', fontWeight: 'bold' }} />
                                        <Column
                                            footer={<b>{selectedDetail.Header?.HeaderVatValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>}
                                        />

                                        <Column
                                            footerStyle={{ color: "#ff5a00" }}

                                            footer={<b>{selectedDetail.Header?.HeaderNetValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>}
                                        />
                                    </Row>
                                </ColumnGroup>
                            }>
                                <Column header="#" body={(_, { rowIndex }) => rowIndex + 1} />
                                <Column field="memo_number" header="PM No." />
                                {/* <Column field="groupname" header="Item Group" /> */}
                                <Column field="ItemName" header="Item Name" />
                                <Column
                                    field="Qty"
                                    header="Qty"
                                    body={(rowData) =>
                                        rowData.Qty?.toLocaleString('en-US', {
                                            style: 'decimal',
                                            minimumFractionDigits: 2
                                        })
                                    }
                                />
                                <Column field="UOMName" header="UOM" />
                                <Column
                                    field="UnitPrice"
                                    header="Unit Price"
                                    body={(rowData) =>
                                        rowData.UnitPrice?.toLocaleString('en-US', {
                                            style: 'decimal',
                                            minimumFractionDigits: 2
                                        })
                                    }
                                />
                                <Column
                                    field="DiscountValue"
                                    header="Discount"
                                    body={(rowData) =>
                                        rowData.DiscountValue?.toLocaleString('en-US', {
                                            style: 'decimal',
                                            minimumFractionDigits: 2
                                        })
                                    }
                                    footer={selectedDetail.Header?.HeaderDiscountValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                />
                                <Column field="taxname" header="Tax" />
                                <Column field="TaxPerc" header="Tax %" />
                                <Column
                                    field="TaxValue"
                                    header="Tax Amount"
                                    body={(rowData) =>
                                        rowData.TaxValue?.toLocaleString('en-US', {
                                            style: 'decimal',
                                            minimumFractionDigits: 2
                                        })
                                    }
                                    footer={selectedDetail.Header?.HeaderTaxValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                />
                                <Column field="vatPerc" header="VAT %" />
                                <Column
                                    field="vatValue"
                                    header="VAT Amount"
                                    body={(rowData) =>
                                        rowData.vatValue?.toLocaleString('en-US', {
                                            style: 'decimal',
                                            minimumFractionDigits: 2
                                        })
                                    }
                                    footer={selectedDetail.Header?.HeaderVatValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                />
                                <Column
                                    field="NetTotal"
                                    header="Total Amount"
                                    body={(rowData) =>
                                        rowData.NetTotal?.toLocaleString('en-US', {
                                            style: 'decimal',
                                            minimumFractionDigits: 2
                                        })
                                    }
                                    bodyStyle={{ color: "#ff5a00" }}
                                    footer={<b >{selectedDetail.Header?.HeaderNetValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>}
                                />
                            </DataTable>


                            <Row className="mt-3">
                                <Col>
                                    <Label>PM Remarks</Label>
                                    <Card className="p-2 bg-light border">
                                        <div style={{ whiteSpace: "pre-wrap" }}>
                                            {selectedDetail.Header?.Memoremarks || "No pm remarks"}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col>
                                    <Label>Remarks</Label>
                                    <Card className="p-2 bg-light border">
                                        <div style={{ whiteSpace: "pre-wrap" }}>
                                            {selectedDetail.Header?.Remarks || "No remarks"}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <DataTable tableStyle={{ width: "60%" }} value={selectedDetail.Attachment}>
                                    <Column header="#" body={(_, { rowIndex }) => rowIndex + 1} />
                                    <Column field="AttachmentName" body={actionMemoBodyTemplate} header="Attachment" />
                                </DataTable>
                            </Row>

                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <button type="button" className="btn btn-danger" onClick={() => setDetailVisible(false)}>
                        <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Close
                    </button>
                </ModalFooter>
            </Modal>

            {/* PO Details Modal */}
            <Modal isOpen={poDetailVisible} toggle={() => setPoDetailVisible(false)} size="xl">
                <ModalHeader toggle={() => setPoDetailVisible(false)}>
                    Purchase Order Details
                </ModalHeader>
                <ModalBody>
                    {selectedPODetail && (
                        <>
                            <Row form>
                                {[
                                    ["PO No.", selectedPODetail.Header?.pono],
                                    ["PO Date", formatDate(selectedPODetail.Header?.podate)],
                                    ["Supplier", selectedPODetail.Header?.suppliername],
                                    ["Currency", selectedPODetail.Header?.currencycode],
                                    ["PR No.", selectedPODetail.Header?.PRConcat || "NA"],
                                ].map(([label, val], i) => (
                                    <Col md="4" key={i} className="form-group row">
                                        <Label className="col-sm-5 col-form-label bold">{label}</Label>
                                        <Col sm="7" className="mt-2">
                                            : {label === "Supplier" ? (
                                                <b>{val || "N/A"}</b>
                                            ) : label === "Currency" ? (
                                                <span style={{ color: "green", fontWeight: "bold" }}>{val || "N/A"}</span>
                                            ) : (
                                                val || "N/A"
                                            )}
                                        </Col>
                                    </Col>
                                ))}
                            </Row>

                            <hr />

                            <DataTable value={selectedPODetail.Requisition || []}>
                                <Column header="#" body={(_, { rowIndex }) => rowIndex + 1} />
                                <Column field="prnumber" header="PR No." />
                                <Column field="groupname" header="Item Group" />
                                <Column field="itemname" header="Item Name" />
                                <Column field="qty" header="Qty" body={(r) => r.qty?.toLocaleString("en-US", { minimumFractionDigits: 3 })} />
                                <Column field="uom" header="UOM" />
                                <Column field="unitprice" header="Unit Price" body={(r) => r.unitprice?.toLocaleString("en-US", { minimumFractionDigits: 2 })} />
                                <Column field="discountvalue" header="Discount" body={(r) => r.discountvalue?.toLocaleString("en-US", { minimumFractionDigits: 2 })} />
                                <Column field="taxperc" header="Tax %" />
                                <Column field="taxvalue" header="Tax Amt" body={(r) => r.taxvalue?.toLocaleString("en-US", { minimumFractionDigits: 2 })} />
                                <Column field="vatperc" header="VAT %" />
                                <Column field="vatvalue" header="VAT Amt" body={(r) => r.vatvalue?.toLocaleString("en-US", { minimumFractionDigits: 2 })} />
                                <Column
                                    field="nettotal"
                                    header="Total Amt"
                                    body={(r) => <span style={{ color: "#ff5a00" }}>{r.nettotal?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>}
                                    bodyStyle={{ color: "#ff5a00" }}
                                    footer={<b style={{ color: "#ff5a00" }}>{selectedPODetail.Header?.nettotal?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</b>}
                                    footerStyle={{ color: "#ff5a00" }}
                                />
                            </DataTable>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <button type="button" className="btn btn-danger" onClick={() => setPoDetailVisible(false)}>
                        Close
                    </button>
                </ModalFooter>
            </Modal>

            {/* Discussion Reply Modal */}
            <Modal isOpen={discussionModalOpen} toggle={() => setDiscussionModalOpen(false)} centered size="lg">
                <ModalHeader toggle={() => setDiscussionModalOpen(false)}>Discussion Chat</ModalHeader>
                <ModalBody>
                    <div
                        className="chat-container mb-3 p-3"
                        style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            backgroundColor: '#f7f7f7',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                        }}
                    >
                        {discussionHistory && discussionHistory.length > 0 ? (
                            [...discussionHistory]
                                .sort((a, b) => new Date(a.logdate) - new Date(b.logdate))
                                .map((msg, index, sortedArr) => {

                                    let cleanMessage = msg.pr_comment || "";

                                    // If original message is effectively empty/null, skip immediately
                                    if (!cleanMessage.trim()) return null;

                                    // 🔹 Valid Chain Check - Removed per user request
                                    // const currentHeader = selectedPR?.pr_comment || selectedPR?.comment || "";
                                    // if (currentHeader && msg.pr_comment && !currentHeader.startsWith(msg.pr_comment)) {
                                    //    return null;
                                    // }

                                    // Diff Logic
                                    if (index > 0) {
                                        const prevComment = sortedArr[index - 1].pr_comment || "";
                                        if (prevComment && cleanMessage.startsWith(prevComment)) {
                                            cleanMessage = cleanMessage.substring(prevComment.length).trim();
                                        }
                                    }

                                    let sender = msg.username;
                                    // Extract sender from "[User at Date]:" pattern
                                    const match = cleanMessage.match(/^\[(.*?)\s+at\s+.*?\]:\s*/);
                                    if (match) {
                                        sender = match[1];
                                        cleanMessage = cleanMessage.replace(match[0], "");
                                    }

                                    // Align logic
                                    const currentUser = getUserDetails();
                                    const isCurrentUser = sender === currentUser?.username;

                                    if (!cleanMessage.trim()) return null;

                                    return (
                                        <div
                                            key={index}
                                            className="d-flex flex-column mb-2"
                                            style={{
                                                alignItems: isCurrentUser ? "flex-end" : "flex-start"
                                            }}
                                        >
                                            <div
                                                className="p-2 px-3"
                                                style={{
                                                    backgroundColor: isCurrentUser ? "#e3f2fd" : "#ffffff",
                                                    color: "#333",
                                                    borderRadius: "12px",
                                                    borderBottomRightRadius: isCurrentUser ? "0" : "12px",
                                                    borderBottomLeftRadius: isCurrentUser ? "12px" : "0",
                                                    maxWidth: "80%",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-baseline gap-2 mb-1">
                                                    <strong style={{ fontSize: "0.85rem", color: isCurrentUser ? "#1565c0" : "#424242" }}>
                                                        {sender}
                                                    </strong>
                                                    <small style={{ fontSize: "0.7rem", color: "#757575" }}>
                                                        {msg.logdate}
                                                    </small>
                                                </div>
                                                <div style={{ wordBreak: "break-word", fontSize: "0.9rem" }}>
                                                    {cleanMessage}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="text-center text-muted fst-italic p-3">
                                No discussion history found.
                            </div>
                        )}
                    </div>
                    <div className="mb-3">
                        <Label for="userReply">Your Reply:</Label>
                        <Input
                            type="textarea"
                            id="userReply"
                            value={userReply}
                            onChange={(e) => setUserReply(e.target.value)}
                            placeholder="Type your message here..."
                            rows={3}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSendReply}>
                        <i className="bx bx-send me-1"></i> Send Reply
                    </Button>
                    <Button color="secondary" onClick={() => setDiscussionModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </React.Fragment >
    );
};

export default ProcurementManagePurchaseRequistion;