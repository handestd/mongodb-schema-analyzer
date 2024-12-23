const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function analyzeCollection(db, collectionName) {
    try {
        const collection = db.collection(collectionName);
        const sample = await collection.findOne();
        
        if (!sample) {
            return {
                name: collectionName,
                fields: {},
                note: 'Collection trống'
            };
        }

        // Phân tích các field
        const fields = {};
        function analyzeObject(obj, prefix = '') {
            for (const [key, value] of Object.entries(obj)) {
                // Bỏ qua field _id và các field con của nó
                if (key === '_id' || prefix.startsWith('_id.')) {
                    continue;
                }

                const fieldName = prefix ? `${prefix}.${key}` : key;
                
                if (value === null) {
                    fields[fieldName] = 'null';
                } else if (Array.isArray(value)) {
                    fields[fieldName] = 'array';
                    if (value.length > 0) {
                        // Nếu là array object, phân tích cấu trúc bên trong
                        if (typeof value[0] === 'object' && value[0] !== null) {
                            analyzeObject(value[0], fieldName);
                        }
                    }
                } else if (typeof value === 'object') {
                    fields[fieldName] = 'object';
                    analyzeObject(value, fieldName);
                } else {
                    fields[fieldName] = typeof value;
                }
            }
        }

        analyzeObject(sample);
        return {
            collection: collectionName,
            fields
        };
    } catch (error) {
        console.error(`Lỗi khi phân tích collection ${collectionName}:`, error);
        return {
            collection: collectionName,
            error: error.message
        };
    }
}

async function analyzeDatabase(dbUrl, dbName) {
    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        
        const collections = await db.listCollections().toArray();
        const schema = {
            database: dbName,
            collections: {}
        };

        for (const collection of collections) {
            console.log(`Đang phân tích collection: ${collection.name}`);
            schema.collections[collection.name] = await analyzeCollection(db, collection.name);
        }

        // Ghi kết quả ra file
        const outputDir = path.join(__dirname, 'schema_output');
        await fs.mkdir(outputDir, { recursive: true });
        
        const filePath = path.join(outputDir, `schema_${dbName}.json`);
        await fs.writeFile(
            filePath,
            JSON.stringify(schema, null, 2),
            'utf8'
        );

        console.log(`Đã ghi schema ra file: ${filePath}`);
        await client.close();

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

// Cấu hình kết nối
const dbUrl = 'mongodb://promotion:ny0QsZlFLF6UfxK7@10.1.150.70:27017,10.1.150.71:27017/promotion?authSource=admin&replicaSet=rs0'; // Thay đổi URL nếu cần
const dbName = 'promotion';       // Thay đổi tên database của bạn

// Chạy phân tích
console.log('Bắt đầu phân tích schema...');
analyzeDatabase(dbUrl, dbName);