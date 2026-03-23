 
using System.Data;
using Core.Abstractions;
using MySql.Data.MySqlClient;
using UserPanel.Core.Abstractions;

namespace UserPanel.Application.Context;

public class DapperUnitOfWork : IUnitOfWorkDB1, IUnitOfWorkDB2, IUnitOfWorkDB3 , IUnitOfWorkDB4
{
    private readonly IMySqlConnectionFactory _connectionFactory;
    private IDbConnection? _connection;
    private IDbTransaction? _transaction;
    private bool _disposed;

    public DapperUnitOfWork(IMySqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public IDbConnection Connection
    {
        get
        {
            if (_connection == null)
            {
                _connection = _connectionFactory.CreateConnection();
                _connection.Open();
                _transaction = _connection.BeginTransaction();
            }
            return _connection;
        }
    }

    public IDbTransaction Transaction
    {
        get
        {
            _ = Connection; // Ensures connection is initialized
            return _transaction!;
        }
    }

    public int Commit()
    {
        if (_transaction == null) return 0;

        try
        {
            _transaction.Commit();
            return 1;
        }
        catch
        {
            _transaction.Rollback();
            return 0;
        }
        finally
        {
            _transaction.Dispose();
            _transaction = _connection?.BeginTransaction();
        }
    }

    public void Dispose()
    {
        if (_disposed) return;

        try
        {
            _transaction?.Commit();
        }
        catch
        {
            _transaction?.Rollback();
        }

        _transaction?.Dispose();
        _connection?.Close();
        _connection?.Dispose();

        _disposed = true;
    }
}