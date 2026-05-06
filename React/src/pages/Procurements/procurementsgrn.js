import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Modal,
  ModalBody,
  FormGroup,
  InputGroup, Input,
  Label,
  ModalFooter,
  ModalHeader
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Select from "react-select";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { UncontrolledAlert } from "reactstrap";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { AutoComplete } from "primereact/autocomplete";
import {
  GetAllGRNList,
  GetGRNById, GetGRNNOAutoComplete, GetGRNNoSeq,
  GetGRNSupplierAutoComplete,
  UpdateStatus as UpdateUserStatus,
} from "../../common/data/mastersapi";
import nodatafound from "assets/images/no-data.png";
import { useHistory } from "react-router-dom";
const getUserDetails = () => {
  if (localStorage.getItem("authUser")) {
    const obj = JSON.parse(localStorage.getItem("authUser"))
    return obj;
  }
}
const renderValueOrDash = value =>
  value !== null && value !== undefined && value !== "" ? value : "-";

const initFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  grnid: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  grnno: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  grndate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  supplier: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  grnvalue: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  CreatedDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  createdbyName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  Status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
});

const ManageProcurementsGRN = () => {
  const [UserData, setUserData] = useState(null);
  const isRestrictedUser = [159, 160, 161, 163, 165].includes(UserData?.u_id);
  const history = useHistory();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(initFilters());
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [userName, setUserName] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [switchStates, setSwitchStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [txtStatus, setTxtStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [successmsg, setSuccessmsg] = useState();
  const [errormsg, setErrormsg] = useState();
  const [selectedFilterType, setSelectedFilterType] = useState(null);
  const [selectedAutoItem, setSelectedAutoItem] = useState(null);
  const [autoSuggestions, setAutoSuggestions] = useState([]);
  const [autoOptions, setAutoOptions] = useState([]);
  const [gRNList, setGRNList] = useState([]);
  const [branchId, setBranchId] = useState(1);
  const [orgId, setOrgId] = useState(1);
  const [statuses] = useState([
    { label: 'Saved', value: 'Saved' },
    { label: 'Posted', value: 'Posted' },
  ]);

  const selectedProductionNo = { value: 12 };
  const quotefilter = { BranchId: 5 };
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState({});

  const getSeverity = (Status) => {
    switch (Status) {
      case 'Posted': return 'success';
      case 'Saved': return 'danger';
      case 'New': return 'info';
    };
  };

  const FilterTypes = [
    { name: "Supplier", value: 1 }, { name: "GRN No", value: 2 }
  ];

  const getDynamicLabel = () => {
    if (selectedFilterType?.value === 1) return "Supplier";
    if (selectedFilterType?.value === 2) return "GRN No";
    return "";
  };

  useEffect(() => {
    fetchGRN();
    const userData = getUserDetails();
    setUserData(userData);

  }, []);

  const fetchGRN = async () => {
    try {
      setLoading(true);
      const orgId = 1;
      const branchId = 1;
      const userData = getUserDetails();
      const res = await GetAllGRNList(0, 0, orgId, branchId, userData?.u_id);
      if (res.status) {
        setGRNList(res.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchGRN();
  };

  const handleCancel = () => {
    setUserName("");
    setFilters(initFilters());
    setGlobalFilterValue("");
    fetchGRN();
  };

  const handleStatusUpdate = async () => {
    if (!selectedRow) return;
    const userId = selectedRow.Id;
    const isActive = selectedRow.IsActive ? 1 : 0;

    const payload = { userId, remark, isActive };

    try {
      const response = await UpdateUserStatus(payload);
      if (response?.statusCode === 0) {

        setSuccessmsg(response.message);
        setIsModalOpen(false);
        await fetchGRN();
      } else {
        setErrormsg(response.message);
        console.error("Failed to update status:", res);
      }
    } catch (err) {
      console.error("An error occurred while updating status:", err);
    }
  };

  const onGlobalFilterChange = e => {
    const value = e.target.value || "";
    setFilters(prev => ({ ...prev, global: { ...prev.global, value } }));
    setGlobalFilterValue(value);
  };

  const openModal = rowData => {
    setTxtStatus(rowData.IsActive === 1 ? "deactivate" : "activate");
    setSelectedRow(rowData);
    setRemark(rowData.Remarks || "");
    setIsModalOpen(true);
  };
  useEffect(() => {
    if (successmsg || errormsg) {
      const timer = setTimeout(() => {
        setSuccessmsg(null);
        setErrormsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successmsg, errormsg]);

  const linkEditGRN = async (rowData) => {
    // debugger
    // console.log("linkedit-rowData", rowData);
    const grnId = rowData.grnid;
    // const orgId = rowData.orgId ?? 1;
    // const branchId = rowData.BranchId ?? 1;
    // try {
    // const grnDetails = await GetGRNById(grnId, branchId, orgId);
    // console.log("grnDetails", grnDetails);
    // history.push({ pathname: "/procurementsadd-grn", state: { grnData: grnDetails } });
    // } catch (err) {
    //   console.error("Failed to fetch user details:", err);
    // }
    history.push(`/procurementsadd-grn/${grnId}`);
  };

  const linkAddGRN = async () => {
    // const orgId = 1;
    // const branchId = 1;
    // const response = await GetGRNNoSeq(branchId, orgId);
    // const grnSeqNo = response.data.grnno;
    // history.push({pathname:"/procurementsadd-grn", state :{grnSeqNo: grnSeqNo}});
    history.push("/procurementsadd-grn");
  };

  const actionBodyTemplate = (rowData) => {

    return (
      <div className="d-flex align-items-center justify-content-center gap-3">
        {(!isRestrictedUser && rowData.Status === "Saved") || Number(UserData?.u_id) === 133 ? (
          <span onClick={() => linkEditGRN(rowData)}
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

  const actionBodyTemplate2 = (rowData) => {
    return (
      <div className="d-flex align-items-center justify-content-center gap-3">
        <span onClick={() => editRow(rowData)} title="Edit">
          <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
        </span>


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

  const clearFilter = () => {
    setSelectedFilterType(null);
    setSelectedAutoItem(null);
    setFilters(initFilters());
    setGlobalFilterValue('');
  };

  const renderHeader = () => {
    return (
      <div className="row align-items-center g-3 clear-spa">
        <div className="col-12 col-lg-6">
          <Button className="btn btn-danger btn-label" onClick={clearFilter}>
            <i className="mdi mdi-filter-off label-icon" /> Clear
          </Button>
        </div>
        <div className="col-12 col-lg-3 text-end">
          <span className="me-4">
            <Tag value="S" severity="danger" /> Saved
          </span>
          <span className="me-1">
            <Tag value="P" severity="success" /> Posted
          </span>
        </div>
        <div className="col-12 col-lg-3">
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

  useEffect(() => {
    const loadOptions = async () => {
      if (!selectedFilterType) {
        setAutoOptions([]);
        return;
      }

      let result = [];
      if (selectedFilterType.value === 1) {
        // Supplier
        result = await GetGRNSupplierAutoComplete(orgId, branchId, "%");
        setAutoOptions(
          (result?.data || []).map(item => ({
            label: item.SupplierName,
            value: item.SupplierId,
          }))
        );
      } else if (selectedFilterType.value === 2) {
        // Requestor
        result = await GetGRNNOAutoComplete(orgId, branchId, "%");
        setAutoOptions(
          (result?.data || []).map(item => ({
            label: item.grnno,
            value: item.grnid,
          }))
        );
      } else {
        setAutoOptions([]);
      }
    };

    loadOptions();
  }, [selectedFilterType, orgId, branchId]);

  const searchData = async () => {
    try {
      const filterType = selectedFilterType?.value || 0;
      const filterValue = selectedAutoItem?.value || 0;

      let result;

      if (filterType === 1) {
        // Search by Supplier
        result = await GetAllGRNList(filterValue, 0, branchId, orgId, UserData?.u_id);
      } else if (filterType === 2) {
        // Search by PO No
        result = await GetAllGRNList(0, filterValue, branchId, orgId, UserData?.u_id);
      } else {
        // Default – load all
        result = await GetAllGRNList(0, 0, branchId, orgId, UserData?.u_id);
      }

      setGRNList(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error while fetching grn:", error);
    }
  };

  const cancelFilter = async () => {
    setSelectedFilterType(null);
    setSelectedAutoItem(null);
    const res = await GetAllGRNList(0, 0, orgId, branchId, UserData?.u_id);
    if (res.status) {
      setGRNList(res.data);
    }
  };

  const handleShowDetails = async (row) => {
    const res = await GetGRNById(row.grnid, orgId, branchId); // GRN API
    if (res.status) {
      let details = res.data.Details || [];

      // Collect unique PO numbers for header concat
      let headerPONumbers = [
        ...new Set(details.map((d) => d.pono).filter(Boolean)),
      ].join(", ");

      if (!headerPONumbers) headerPONumbers = "NA";

      setSelectedDetail({
        ...res.data,
        Header: {
          ...res.data.Header,
          POConcat: headerPONumbers, // header field with PO numbers
        },
        Details: details, // detail lines from API
      });

      setDetailVisible(true);
    } else {
      Swal.fire("Error", "Data is not available", "error");
    }
  };

  const actionclaimBodyTemplate = (rowData) => {
    return <span style={{ cursor: "pointer", color: "blue" }} className="btn-rounded btn btn-link"
      onClick={() => handleShowDetails(rowData)}>{rowData.grnno}</span>;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Procurement" breadcrumbItem="Goods Receipt Note" />

        {/* Filters/Search Area */}
        <Row>
          {errormsg && (
            <UncontrolledAlert color="danger">
              {errormsg}
            </UncontrolledAlert>
          )}
          {successmsg && (
            <UncontrolledAlert color="success">

              {successmsg}
            </UncontrolledAlert>
          )}
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
                {!isRestrictedUser && (
                  <button type="button" className="btn btn-success" onClick={linkAddGRN}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                )}
              </div>
            </div>
          </Card>
        </Row>

        {/* Users Table */}
        <Row>
          <Col lg="12">
            <Card className="p-3">
              <DataTable
                value={gRNList}
                paginator
                rows={20}
                loading={loading}
                dataKey="id"
                filters={filters}
                globalFilterFields={["grnno", "grndate", "suppliername", 'CreatedDate', 'createdbyName', "grnvalue", "Status"]}
                sortField="grnDate"
                header={renderHeader()}
                emptyMessage={
                  <div className="text-center p-4">
                    <img
                      src={nodatafound}
                      alt="No Data"
                      style={{ maxWidth: "47px", marginBottom: "1rem" }}
                    />
                    <div className="font-size-14 fw-bold">No GRNs Found</div>
                  </div>
                }
                onFilter={(e) => setFilters(e.filters)}
              >

                <Column field="grnno" header="GRN No" className="text-left" filter style={{ width: "10%" }} body={actionclaimBodyTemplate} />

                <Column
                  field="grndate"
                  header="GRN Date"
                  filter
                  filterPlaceholder="Search by GRN Date"
                  className="text-center"
                  style={{ width: "10%" }}
                />

                <Column
                  field="suppliername"
                  header="Supplier"
                  className="text-left"
                  filter
                />
                <Column
                  field="CreatedDate"
                  header="Created Date"
                  filter
                  filterPlaceholder="Search by created date"
                  className="text-left"
                />
                <Column
                  field="createdbyName"
                  header="Created By"
                  filter
                  filterPlaceholder="Search by created by"
                  className="text-left"
                />
                {/* 
                <Column
                  field="grnvalue"
                  header="Total Amount"
                  className="text-lg-end"
                  // filter
                  style={{ width: "15%" }}
                /> */}

                <Column
                  field="Status"
                  header="Status"
                  filterMenuStyle={{ width: '14rem' }}
                  body={statusBodyTemplate}
                  filter filterElement={statusFilterTemplate}
                  className="text-center" style={{ width: "10%" }}
                />

                <Column
                  header="Action"
                  body={actionBodyTemplate}
                  showFilterMatchMode={false}
                  className="text-center"
                  style={{ width: "100px" }}
                />
              </DataTable>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
        <ModalBody className="py-3 px-5">
          <Row>
            <Col className="text-center">
              <i
                className="mdi mdi-alert-circle-outline"
                style={{ fontSize: "9em", color: "orange" }}
              />
              <h4>Do you want to {txtStatus} this account?</h4>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <FormGroup>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Remarks"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                />
              </FormGroup>
              <div className="text-center mt-3 button-items">
                <Button
                  className="btn btn-info"
                  color="success"
                  size="lg"
                  onClick={handleStatusUpdate}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => {
                    setIsModalOpen(false);
                    setRemark("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
      <Modal isOpen={detailVisible} toggle={() => setDetailVisible(false)} size="xl">
        <ModalHeader toggle={() => setDetailVisible(false)}>GRN Details</ModalHeader>
        <ModalBody>
          {selectedDetail && (
            <>
              {/* GRN Header Section */}
              <Row form>
                {[
                  ["GRN No.", selectedDetail.Header?.grnno],
                  ["GRN Date", selectedDetail.Header?.grndate?.split("T")[0]],
                  ["Supplier", selectedDetail.Header?.suppliername],
                  ["PO No(s).", selectedDetail.Header?.POConcat], // concat of all POs
                ].map(([label, val], i) => (
                  <Col md="4" key={i} className="form-group row">
                    <Label className="col-sm-5 col-form-label bold">{label}</Label>
                    <Col sm="7" className="mt-2">: {val}</Col>
                  </Col>
                ))}
              </Row>

              <hr />

              {/* GRN Details Table */}
              <DataTable value={selectedDetail.Details}>
                <Column header="#" body={(_, { rowIndex }) => rowIndex + 1} />
                <Column field="pono" header="PO No." />
                <Column field="itemDescription" header="Item Description" />

                <Column field="dono" header="DO No." />
                <Column field="dodate" header="DO Date" body={(row) => row.dodate?.split("T")[0]} />

                <Column field="poqty" header="PO Qty" body={(row) => parseFloat(row.poqty || 0).toLocaleString("en-US")} />
                <Column field="UOM" header="UOM" />
                <Column field="alreadyrecqty" header="Recd Qty" body={(row) => parseFloat(row.alreadyrecqty || 0).toLocaleString("en-US")} />
                <Column field="oribalanceqty" header="Bal Qty" body={(row) => parseFloat(row.oribalanceqty || 0).toLocaleString("en-US")} />
                <Column field="grnQty" header="GRN Qty" body={(row) => parseFloat(row.grnQty || 0).toLocaleString("en-US")} />
                <Column field="containerno" header="Contnr No." />
              </DataTable>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <button type="button" className="btn btn-danger" onClick={() => setDetailVisible(false)}>
            <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Close
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ManageProcurementsGRN;