import React, { useEffect, useState } from "react";
import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { GetAllPayment } from "../../../common/data/mastersapi";

const PaymentHistory = ({ poId }) => {
  const [groupedData, setGroupedData] = useState({});
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    if (poId) {
      fetchPaymentHistory(poId);
    }
  }, [poId]);

  const fetchPaymentHistory = async (poId) => {
    try {
      const poidString = poId.join(",");
      const res = await GetAllPayment(1, poidString);

      const claimList =
        res && res.status && Array.isArray(res.data)
          ? res.data
          : [];

      if (claimList.length > 0) {
        const grouped = claimList.reduce((acc, item) => {
          const po = item.pono || "N/A";
          if (!acc[po]) acc[po] = [];
          acc[po].push(item);
          return acc;
        }, {});

        setGroupedData(grouped);

        // Set first PO as default active tab
        const firstPo = Object.keys(grouped)[0];
        setActiveTab(firstPo);
      } else {
        setGroupedData({});
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setGroupedData({});
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="container mt-0">
      {/* Tabs */}
      <Nav tabs>
        {Object.keys(groupedData).map((po) => (
          <NavItem key={po}>
            <NavLink
              className={classnames({ active: activeTab === po })}
              onClick={() => toggleTab(po)}
              style={{ cursor: "pointer" }}
            >
              {po}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      {/* Tab Content */}
      <TabContent activeTab={activeTab}>
        {Object.entries(groupedData).map(([po, records]) => (
          <TabPane tabId={po} key={po}>
            <div className="mt-3">
              <DataTable
                value={records}
                paginator
                rows={5}
                responsiveLayout="scroll"
                emptyMessage="No payment history found."
                showGridlines
              >
                <Column
                  header="#"
                  body={(_, { rowIndex }) => rowIndex + 1}
                  style={{ width: "50px" }}
                />
                <Column field="payment_Date" header="PAYMENT DATE" />
                <Column field="suppliername" header="SUPPLIER NAME" />
                <Column field="payment_mode" header="MODE OF PAYMENT" />
                <Column field="payment" header="AMOUNT" body={(rowData) =>
                  rowData.payment?.toLocaleString("en-US", { minimumFractionDigits: 2 })
                } />
                <Column field="createdbyName" header="CREATED BY" />
              </DataTable>
            </div>
          </TabPane>
        ))}
      </TabContent>
    </div>
  );
};

export default PaymentHistory;