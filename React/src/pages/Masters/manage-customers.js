import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  FormGroup,
  Input,
  InputGroup,
} from "reactstrap";
import { toast } from 'react-toastify';
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { classNames } from "primereact/utils";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Slider } from "primereact/slider";
import { Tag } from "primereact/tag";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import "primereact/resources/themes/lara-light-blue/theme.css";
import Flatpickr from "react-flatpickr";
import { LoadCustomerList, ToggleChangeCustomerStatus, GetCustomer } from "../../../src/common/data/mastersapi";
import { useHistory } from "react-router-dom";
// Move the initFilters function definition above
const initFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CustomerCode: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  CustomerName: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Email: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  PhoneNumber: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
});

const ManageCustomer = () => {
  const history = useHistory();
  const [selectedDate, setSelectedDate] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState(initFilters());
  const [loading, setLoading] = useState(false);
  const [switchStates, setSwitchStates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [txtStatus, setTxtStatus] = useState(null);
  const [customerName, setCustomerName] = useState("");
  //   useEffect(() => {
  //     const customerData = getCustomers();
  //     setCustomers(customerData);

  //     const initialSwitchStates = {};
  //     customerData.forEach(customer => {
  //       initialSwitchStates[customer.Code] = customer.Active === 1;
  //     });
  //     setSwitchStates(initialSwitchStates);
  //   }, []);
  useEffect(() => {
    loadCustomerList();
  }, []);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const toggleModal2 = () => {
    setIsModalOpen2(!isModalOpen2);
  };
  const loadCustomerList = async (searchvalue = "") => {
    setLoading(true);
    debugger
    const params = {
      customerName: searchvalue,
      tabId: 0,
      customerId: 0,
      contactId: 0,
      addressId: 0,
      branchId: 0,
      userId: 0,
    };
    try {
      let data = await LoadCustomerList(params);

      if (!data || data.length === 0) {
        console.log("Primary API empty. Falling back to GetCustomer...");
        const fallbackData = await GetCustomer(1, 0, searchvalue || "%");
        if (fallbackData && fallbackData.length > 0) {
          data = fallbackData.map(c => ({
            ...c,
            CustomerCode: c.CustomerCode || c.code || `CUST-${c.CustomerId || c.Id || ""}`,
            CustomerName: c.CustomerName || c.Customer || "-",
            Email: c.Email || "",
            PhoneNumber: c.PhoneNumber || "",
            IsActive: c.IsActive !== undefined ? c.IsActive : 1,
            Id: c.CustomerId || c.Id
          }));
        }
      }

      debugger;
      const safeData = data || [];
      setCustomers(safeData);
      const initialSwitchStates = {};
      safeData.forEach(c => {
        initialSwitchStates[c.CustomerCode] = c.IsActive === 1;
      });
      setSwitchStates(initialSwitchStates);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };
  const clearFilter = () => {
    setCustomerName("");
    setFilters(initFilters());
    setGlobalFilterValue("");
  };

  const existEmails = useMemo(() => {
    return (customers || [])
      .filter(c => !!c.Email)
      .map(c => c.Email.toLowerCase());
  }, [customers]);

  const editRow = rowData => {
    console.log("Edit row:", rowData);
    history.push("/add-customer", { contactData: rowData, emaillist: existEmails });
  };
  const onGlobalFilterChange = e => {
    const value = e.target.value;
    let updatedFilters = { ...filters };
    updatedFilters["global"].value = value;

    setFilters(updatedFilters);
    setGlobalFilterValue(value);
  };

  const handleSearch = () => {
    debugger
    loadCustomerList(customerName);
  };

  const handleSearchCancel = () => {
    loadCustomerList("");
    setCustomerName("");
  };

  const renderHeader = () => {
    return (
      <div className="row align-items-center g-3 clear-spa">
        <div className="col-12 col-lg-3">
          <Button
            className="btn btn-danger btn-label"
            onClick={clearFilter}
            outlined
          >
            <i className="mdi mdi-filter-off label-icon" />
            Clear
          </Button>
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

  const header = renderHeader();

  const filterClearTemplate = options => {
    return (
      <Button
        type="button"
        icon="pi pi-times"
        onClick={options.filterClearCallback}
        severity="secondary"
      ></Button>
    );
  };

  const filterApplyTemplate = options => {
    return (
      <Button
        type="button"
        icon="pi pi-check"
        onClick={options.filterApplyCallback}
        severity="success"
      ></Button>
    );
  };

  const filterFooterTemplate = () => {
    return <div className="px-3 pt-0 pb-3 text-center">Filter by Country</div>;
  };

  const linkAddcustomer = () => {
    console.log("customers", customers);
    console.log("existEmails", existEmails);
    history.push("/add-customer", { customers: customers, emaillist: existEmails });
  };

  const actionBodyTemplate = rowData => {
    if (!rowData.IsActive) {
      return (
        <div className="actions">

          <span
            style={{
              cursor: 'not-allowed',
              opacity: 0.5,
              pointerEvents: 'none'
            }}
            title={"Disabled"}>
            <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
          </span>
          {/* <span onClick={() => deleteRow(rowData)} title="Delete">
                <i className="mdi mdi-trash-can-outline label-icon" style={{ fontSize: '1.5rem' }}></i> </span> */}
        </div>
      )
    }
    else {
      return (
        rowData.IsActive && (
          <div className="actions">
            <span onClick={() => editRow(rowData)} title="Edit">
              <i
                className="mdi mdi-square-edit-outline"
                style={{ fontSize: "1.5rem" }}
              ></i>
            </span>
          </div>
        )
      );
    }
  };

  const onSwitchChange = async () => {
    if (!selectedRow) return;

    const customerCode = selectedRow.CustomerCode;
    const newStatus = !switchStates[customerCode];
    const isActive = selectedRow.IsActive === 1 ? false : true;
    debugger
    const payload = {
      customerId: selectedRow.Id,
      branchId: 1,
      userId: 1,
      iscustomer: true,
      isActive: isActive,
      contactId: 0,
      addressId: 0,
    };

    try {
      const response = await ToggleChangeCustomerStatus(payload);

      if (response?.statusCode === 0 || response?.status === true) {
        toast.success(response.message || "Status updated successfully.");
        // Update local state so customer stays in the grid with updated active status
        const updatedIsActive = isActive ? 1 : 0;
        setCustomers(prev =>
          prev.map(c =>
            c.CustomerCode === customerCode
              ? { ...c, IsActive: updatedIsActive }
              : c
          )
        );
        setSwitchStates(prev => ({
          ...prev,
          [customerCode]: isActive,
        }));
      } else {
        toast.error(response?.message || "Toggle failed.");
      }
    } catch (error) {
      toast.error("An error occurred during toggle.");
      console.error("Toggle error:", error);
    } finally {
      setIsModalOpen(false);
    }
  };


  const openModal = rowData => {
    const value = rowData.IsActive == 1 ? "deactive" : "active";
    setTxtStatus(value);
    setSelectedRow(rowData);
    setIsModalOpen(true);
  };

  const actionBodyTemplate2 = rowData => {
    return (
      <div className="square-switch">
        <Input
          type="checkbox"
          id={`square-switch-${rowData.CustomerCode}`}
          switch="bool"
          onChange={() => openModal(rowData)}
          checked={switchStates[rowData.CustomerCode] || false}
        />
        <label
          htmlFor={`square-switch-${rowData.CustomerCode}`}
          data-on-label="Yes"
          data-off-label="No"
          style={{ margin: 0 }}
        />
      </div>
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Masters" breadcrumbItem="Customers" />
          <Row>
            <Card className="search-top">
              <div className="row align-items-center g-1 quotation-mid">
                <div className="col-12 col-lg-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                      <label htmlFor="name" className="form-label mb-0">
                        Customer Name
                      </label>
                    </div>
                    <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                      <input id="name" type="text" className="form-control"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)} />
                    </div>
                  </div>
                </div>
                {/* <div className="col-12 col-lg-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                      <label htmlFor="fromDate" className="form-label mb-0">
                        From
                      </label>
                    </div>
                    <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                      <FormGroup>
                        <Label></Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd-mm-yyyy"
                            options={{
                              altInput: true,
                              altFormat: "d-M-Y",
                              dateFormat: "Y-m-d",
                            }}
                            value={selectedDate}
                            onChange={dates => setSelectedDate(dates[0])}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                      <label htmlFor="toDate" className="form-label mb-0">
                        To
                      </label>
                    </div>
                    <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                      <FormGroup>
                        <Label></Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd-mm-yyyy"
                            options={{
                              altInput: true,
                              altFormat: "d-M-Y",
                              dateFormat: "Y-m-d",
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div> */}
                <div
                  className="col-12 col-lg-4 text-end button-items"
                  style={{ marginLeft: '32%' }}
                >
                  <button type="button" className="btn btn-info" onClick={handleSearch}>
                    {" "}
                    <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>{" "}
                    Search
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleSearchCancel}>
                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={linkAddcustomer}
                  >
                    <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>
                    New
                  </button>
                </div>
              </div>
            </Card>

            <Col lg="12">
              <Card>
                <DataTable
                  value={customers}
                  paginator
                  showGridlines
                  rows={10}
                  loading={loading}
                  dataKey="CustomerCode"
                  filters={filters}
                  globalFilterFields={[
                    "CustomerCode",
                    "CustomerName",
                    "Email",
                    "PhoneNumber",
                  ]}
                  header={header}
                  emptyMessage="No customers found."
                  onFilter={e => setFilters(e.filters)}
                >
                  <Column
                    field="CustomerCode"
                    header="Code"
                    style={{ width: "8%" }}
                    className="text-left"
                    filter
                    filterPlaceholder="Search by code"
                  />
                  <Column
                    field="CustomerName"
                    header="Name"
                    filter
                    filterPlaceholder="Search by name"
                  />
                  <Column
                    field="Email"
                    header="Email"
                    filter
                    filterPlaceholder="Search by email"
                  />
                  <Column
                    field="PhoneNumber"
                    header="Phone"
                    filter
                    filterPlaceholder="Search by phone"
                  />
                  {/* Add other columns as needed */}
                  <Column
                    field="IsActive"
                    header="Active"
                    showFilterMatchModes={false}
                    body={actionBodyTemplate2}
                    className="text-center"
                    headerClassName="text-center"
                    style={{ width: "8%" }}
                  />

                  <Column
                    field="actions"
                    header="Action"
                    showFilterMatchModes={false}
                    body={actionBodyTemplate}
                    className="text-center"
                    headerClassName="text-center"
                    style={{ width: "8%" }}
                  />


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
                <i
                  className="mdi mdi-alert-circle-outline"
                  style={{ fontSize: "9em", color: "orange" }}
                />
                <h4>Do you want to {txtStatus} this account?</h4>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="text-center mt-3 button-items">
                <Button
                  className="btn btn-info"
                  color="success"
                  size="lg"
                  onClick={onSwitchChange}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default ManageCustomer;