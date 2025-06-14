// import * as SQLite from "expo-sqlite"

// export interface ReceiptItem {
//   id?: number
//   name: string
//   price: string
//   quantity: string
//   receiptId: number
// }

// export interface Receipt {
//   id?: number
//   employee: string
//   pos: string
//   total: string
//   paymentMethod: string
//   paymentAmount: string
//   dateTime: string
//   receiptNumber: string
//   items?: ReceiptItem[]
// }

// // Use a singleton pattern for database connection
// let database: SQLite.SQLiteDatabase | null = null

// export const getDatabase = async () => {
//   if (!database) {
//     database = await SQLite.openDatabaseAsync("receipts.db")
//   }
//   return database
// }

// export const initDatabase = async () => {
//   const db = await getDatabase()

//   // Create receipts table
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS receipts (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       employee TEXT NOT NULL,
//       pos TEXT,
//       total TEXT NOT NULL,
//       paymentMethod TEXT NOT NULL,
//       paymentAmount TEXT NOT NULL,
//       dateTime TEXT NOT NULL,
//       receiptNumber TEXT NOT NULL
//     );

//     CREATE TABLE IF NOT EXISTS receipt_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       price TEXT NOT NULL,
//       quantity TEXT NOT NULL,
//       receiptId INTEGER NOT NULL,
//       FOREIGN KEY (receiptId) REFERENCES receipts (id) ON DELETE CASCADE
//     );
//   `)

//   return db
// }

// export const saveReceipt = async (receiptData: Receipt) => {
//   try {
//     console.log("💾 Attempting to save receipt:", receiptData)

//     const db = await getDatabase()

//     // Validate input data
//     if (!receiptData) {
//       throw new Error("Receipt data is null or undefined")
//     }

//     // Use a transaction to ensure data consistency
//     return await db.withTransactionAsync(async () => {
//       // Save receipt
//       const result = await db.runAsync(
//         "INSERT INTO receipts (employee, pos, total, paymentMethod, paymentAmount, dateTime, receiptNumber) VALUES (?, ?, ?, ?, ?, ?, ?)",
//         receiptData.employee || "Unknown",
//         receiptData.pos || "",
//         receiptData.total || "#0.00",
//         receiptData.paymentMethod || "Cash",
//         receiptData.paymentAmount || "#0.00",
//         receiptData.dateTime || new Date().toLocaleString(),
//         receiptData.receiptNumber || "0-0000",
//       )

//       const receiptId = result.lastInsertRowId
//       console.log("✅ Receipt saved with ID:", receiptId)

//       // Save receipt items if they exist
//       if (Array.isArray(receiptData.items) && receiptData.items.length > 0) {
//         for (const item of receiptData.items) {
//           if (item && item.name && item.price && item.quantity) {
//             await db.runAsync(
//               "INSERT INTO receipt_items (name, price, quantity, receiptId) VALUES (?, ?, ?, ?)",
//               item.name,
//               item.price,
//               item.quantity,
//               receiptId,
//             )
//           }
//         }
//         console.log("✅ Receipt items saved:", receiptData.items.length)
//       }

//       return receiptId
//     })
//   } catch (error) {
//     console.error("❌ Error saving receipt:", error)
//     throw error
//   }
// }

// export const getAllReceipts = async (): Promise<Receipt[]> => {
//   try {
//     const db = await getDatabase()
//     return await db.getAllAsync("SELECT * FROM receipts ORDER BY dateTime DESC")
//   } catch (error) {
//     console.error("Error fetching all receipts:", error)
//     return []
//   }
// }

// export const getReceiptById = async (id: number): Promise<Receipt | null> => {
//   try {
//     const db = await getDatabase()
//     const receipt = await db.getFirstAsync<Receipt>("SELECT * FROM receipts WHERE id = ?", id)

//     if (!receipt) {
//       return null
//     }

//     const items = await db.getAllAsync<ReceiptItem>("SELECT * FROM receipt_items WHERE receiptId = ?", id)

//     // Create a new object with the receipt data and items
//     return {
//       id: receipt.id,
//       employee: receipt.employee,
//       pos: receipt.pos,
//       total: receipt.total,
//       paymentMethod: receipt.paymentMethod,
//       paymentAmount: receipt.paymentAmount,
//       dateTime: receipt.dateTime,
//       receiptNumber: receipt.receiptNumber,
//       items: items,
//     }
//   } catch (error) {
//     console.error(`Error fetching receipt with id ${id}:`, error)
//     return null
//   }
// }

// export const deleteReceipt = async (id: number): Promise<boolean> => {
//   try {
//     const db = await getDatabase()

//     // Use a transaction to ensure data consistency
//     await db.withTransactionAsync(async () => {
//       await db.runAsync("DELETE FROM receipt_items WHERE receiptId = ?", id)
//       await db.runAsync("DELETE FROM receipts WHERE id = ?", id)
//     })

//     return true
//   } catch (error) {
//     console.error(`Error deleting receipt with id ${id}:`, error)
//     return false
//   }
// }




import * as SQLite from 'expo-sqlite';

export interface ReceiptItem {
  id?: number;
  name: string;
  price: string;
  quantity: string;
  receiptId: number;
}

export interface Receipt {
  id?: number;
  employee: string;
  pos: string;
  total: string;
  paymentMethod: string;
  paymentAmount: string;
  dateTime: string;
  receiptNumber: string;
  items?: ReceiptItem[];
}

export const getDatabase = async () => {
  return await SQLite.openDatabaseAsync('receipts.db');
};

export const initDatabase = async () => {
  const db = await getDatabase();
  
  // Create receipts table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee TEXT NOT NULL,
      pos TEXT,
      total TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      paymentAmount TEXT NOT NULL,
      dateTime TEXT NOT NULL,
      receiptNumber TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS receipt_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      quantity TEXT NOT NULL,
      receiptId INTEGER NOT NULL,
      FOREIGN KEY (receiptId) REFERENCES receipts (id) ON DELETE CASCADE
    );
  `);
  
  return db;
};

export const saveReceipt = async (receiptData: Receipt) => {
  try {
    const db = await getDatabase();
    
    // Save receipt
    const result = await db.runAsync(
      'INSERT INTO receipts (employee, pos, total, paymentMethod, paymentAmount, dateTime, receiptNumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
      receiptData.employee,
      receiptData.pos || '',
      receiptData.total,
      receiptData.paymentMethod,
      receiptData.paymentAmount,
      receiptData.dateTime,
      receiptData.receiptNumber
    );
    
    const receiptId = result.lastInsertRowId;
    
    // Save receipt items
    if (Array.isArray(receiptData.items)) {
      for (const item of receiptData.items) {
        await db.runAsync(
          'INSERT INTO receipt_items (name, price, quantity, receiptId) VALUES (?, ?, ?, ?)',
          item.name,
          item.price,
          item.quantity,
          receiptId
        );
      }
    }
    
    return receiptId;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

export const getAllReceipts = async (): Promise<Receipt[]> => {
  try {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM receipts ORDER BY dateTime DESC');
  } catch (error) {
    console.error('Error fetching all receipts:', error);
    return [];
  }
};

export const getReceiptById = async (id: number): Promise<Receipt | null> => {
  try {
    const db = await getDatabase();
    const receipt = await db.getFirstAsync<Receipt>('SELECT * FROM receipts WHERE id = ?', id);
    
    if (!receipt) {
      return null;
    }
    
    const items = await db.getAllAsync<ReceiptItem>('SELECT * FROM receipt_items WHERE receiptId = ?', id);
    
    // Create a new object with the receipt data and items
    return {
      id: receipt.id,
      employee: receipt.employee,
      pos: receipt.pos,
      total: receipt.total,
      paymentMethod: receipt.paymentMethod,
      paymentAmount: receipt.paymentAmount,
      dateTime: receipt.dateTime,
      receiptNumber: receipt.receiptNumber,
      items: items
    };
  } catch (error) {
    console.error(`Error fetching receipt with id ${id}:`, error);
    return null;
  }
};

export const deleteReceipt = async (id: number): Promise<boolean> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM receipt_items WHERE receiptId = ?', id);
    await db.runAsync('DELETE FROM receipts WHERE id = ?', id);
    return true;
  } catch (error) {
    console.error(`Error deleting receipt with id ${id}:`, error);
    return false;
  }
};