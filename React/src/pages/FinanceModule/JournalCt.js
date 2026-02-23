import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
    Container,
    Card,
    CardBody,
    Row,
    Col,
    Label,
    Button
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from 'primereact/api';
import axios from "axios";
import { PYTHON_API_URL } from "../../common/pyapiconfig";

const JournalCt = () => {
    const history = useHistory();
    // Dates
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    // Grid Data & loading
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${PYTHON_API_URL}/journal/get-all-journals`);
                if (response.data?.status) {
                    setJournals(response.data.data || []);
                } else {
                    setJournals([]);
                }
            } catch (error) {
                console.error("Failed to fetch journals:", error);
                setJournals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJournals();
    }, []);

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

    const renderHeader = () => {
        return (
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
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex gap-2 justify-content-center">
                <span
                    className="text-primary cursor-pointer"
                    title="Edit"
                    style={{ cursor: 'pointer' }}
                    onClick={() => history.push(`/add-journal?id=${rowData.id}`)}
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
        return rowData.amount.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2 });
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="Journal ct" />

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
                                    <button type="button" className="btn btn-success" onClick={() => history.push("/add-journal")}>
                                        <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i> New
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col lg="12">
                        <Card>
                            <DataTable
                                value={journals}
                                paginator
                                rows={10}
                                loading={loading}
                                dataKey="id"
                                filters={filters}
                                globalFilterFields={['journalNo', 'description', 'status']}
                                header={renderHeader()}
                                emptyMessage="No journals found."
                                className="p-datatable-gridlines"
                                showGridlines
                            >
                                <Column field="journalNo" header="Journal No" sortable style={{ minWidth: '120px' }} />
                                <Column field="date" header="Date" sortable style={{ minWidth: '100px' }} />
                                <Column field="description" header="Description" sortable style={{ minWidth: '200px' }} />
                                <Column field="amount" header="Amount" body={amountBodyTemplate} sortable className="text-end" style={{ minWidth: '120px' }} />
                                <Column field="status" header="Status" body={statusBodyTemplate} sortable className="text-center" style={{ minWidth: '100px' }} />
                                <Column header="Action" body={actionBodyTemplate} className="text-center" style={{ minWidth: '100px' }} />
                            </DataTable>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default JournalCt;