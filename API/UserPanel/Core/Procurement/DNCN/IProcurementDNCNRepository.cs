using System;
using System.Threading.Tasks;

namespace Core.Procurement.DNCN
{
    public interface IProcurementDNCNRepository
    {
        Task<object> GetAllCreditNotes();
        Task<object> GetAllDebitNotes();
        Task<object> GetCreditNoteById(int id);
        Task<object> GetDebitNoteById(int id);
        Task<object> CreateCreditNote(SupplierCreditNote note);
        Task<object> CreateDebitNote(SupplierDebitNote note);
        Task<object> UpdateCreditNote(SupplierCreditNote note);
        Task<object> UpdateDebitNote(SupplierDebitNote note);
        Task<object> DeleteCreditNote(int id);
        Task<object> DeleteDebitNote(int id);
        Task<object> GetItemsByInvoiceId(int invoiceId);
    }
}
