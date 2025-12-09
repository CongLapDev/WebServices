import { useContext, useState, useEffect, useMemo } from "react";
import { GlobalContext } from "../../../context";
import APIBase from "../../../api/ApiBase";
import { Card, Table, Button, Space, Input, Row, Col, Modal, Tag, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import CategoryAddRootModal from "../../../part/admin/category/CategoryAddRootModal";
import CategoryEditModal from "../../../part/admin/category/CategoryEditModal";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";
import { deleteCategory } from "../../../api/category";
import styles from "./style.module.scss";

function AdminCategoryManagePage() {
    const globalContext = useContext(GlobalContext);
    const [data, setData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const fetchData = () => {
        setLoading(true);
        globalContext.loader(true);
        APIBase.get("api/v1/category/1")
            .then(payload => {
                setData(payload.data);
                setCategories(payload.data?.children || []);
            })
            .catch(err => {
                console.error(err);
                globalContext.message.error("Failed to load categories");
            })
            .finally(() => {
                setLoading(false);
                globalContext.loader(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCategory = (newCategory) => {
        setCategories(prev => [...prev, newCategory]);
        fetchData(); // Refresh to get updated data
    };

    const handleEditCategory = (updatedCategory) => {
        setCategories(prev => 
            prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
        );
        fetchData(); // Refresh to get updated data
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            globalContext.loader(true);
            await deleteCategory(categoryId);
            globalContext.message.success("Category deleted successfully");
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
            fetchData(); // Refresh to get updated data
        } catch (error) {
            console.error(error);
            globalContext.message.error("Failed to delete category");
        } finally {
                    globalContext.loader(false);
                }
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setEditModalVisible(true);
    };

    // Filter categories (including nested children)
    const filterCategories = (cats, searchTerm) => {
        if (!searchTerm) return cats;
        
        const filtered = [];
        cats.forEach(cat => {
            const matches = cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (matches) {
                filtered.push(cat);
            } else if (Array.isArray(cat.children) && cat.children.length > 0) {
                const filteredChildren = filterCategories(cat.children, searchTerm);
                if (filteredChildren.length > 0) {
                    filtered.push({ ...cat, children: filteredChildren });
                }
            }
        });
        return filtered;
    };

    const filteredCategories = useMemo(() => {
        return filterCategories(categories, searchText);
    }, [categories, searchText]);

    const hasChildren = (record) => {
        return Array.isArray(record.children) && record.children.length > 0;
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 100,
            sorter: (a, b) => a.id - b.id,
            render: (text) => {
                return <span>{text}</span>;
            },
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name?.localeCompare(b.name),
            render: (text, record) => {
                const isParent = hasChildren(record);
                
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link 
                            to={`/admin/category/${record.id}`} 
                            style={{ 
                                fontWeight: isParent ? 500 : 400,
                                color: isParent ? '#1890ff' : '#000000d9'
                            }}
                        >
                            {text}
                        </Link>
                    </div>
                );
            },
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text) => text || '-',
        },
        {
            title: "Children",
            key: "children",
            width: 100,
            render: (_, record) => {
                const count = Array.isArray(record.children) ? record.children.length : 0;
                if (count === 0) return <Tag>-</Tag>;
                return <Tag color="blue">{count}</Tag>;
            },
        },
        {
            title: "Actions",
            key: "actions",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<PrefixIcon><i className="fi fi-rr-edit"></i></PrefixIcon>}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete category"
                        description={`Are you sure you want to delete "${record.name}"? This action cannot be undone.`}
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            icon={<PrefixIcon><i className="fi fi-rr-trash"></i></PrefixIcon>}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Expanded row render for children
    const expandedRowRender = (parentRecord) => {
        if (!hasChildren(parentRecord)) return null;

        const childColumns = [
            {
                title: "ID",
                dataIndex: "id",
                key: "id",
                width: 100,
                render: (text) => (
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '40px' }}>
                        <span className={styles.childIndicator}>└</span>
                        <span>{text}</span>
                    </div>
                ),
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                render: (text, record) => (
                    <div style={{ paddingLeft: '40px' }}>
                        <Link 
                            to={`/admin/category/${record.id}`} 
                            style={{ fontWeight: 400 }}
                        >
                            {text}
                        </Link>
                    </div>
                ),
            },
            {
                title: "Description",
                dataIndex: "description",
                key: "description",
                ellipsis: true,
                render: (text) => text || '-',
            },
            {
                title: "Children",
                key: "children",
                width: 100,
                render: (_, record) => {
                    const count = Array.isArray(record.children) ? record.children.length : 0;
                    if (count === 0) return <Tag>-</Tag>;
                    return <Tag color="blue">{count}</Tag>;
                },
            },
            {
                title: "Actions",
                key: "actions",
                width: 200,
                render: (_, record) => (
                    <Space>
                        <Button
                            type="primary"
                            icon={<PrefixIcon><i className="fi fi-rr-edit"></i></PrefixIcon>}
                            size="small"
                            onClick={() => handleEdit(record)}
                        >
                            Edit
                        </Button>
                        <Popconfirm
                            title="Delete category"
                            description={`Are you sure you want to delete "${record.name}"? This action cannot be undone.`}
                            onConfirm={() => handleDeleteCategory(record.id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                danger
                                icon={<PrefixIcon><i className="fi fi-rr-trash"></i></PrefixIcon>}
                                size="small"
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        return (
            <div className={styles.childTableWrapper}>
                <Table
                    columns={childColumns}
                    dataSource={parentRecord.children}
                    rowKey="id"
                    pagination={false}
                    showHeader={false}
                    size="small"
                    rowClassName={() => 'child-row'}
                />
            </div>
        );
    };

    return (
        <Card 
            title={
                <Row justify="space-between" align="middle">
                    <Col>
                        <span style={{ fontSize: "20px", fontWeight: 500 }}>
                            Category Management
                        </span>
                    </Col>
                    <Col>
                        <Space>
                            <Input
                                placeholder="Search categories..."
                                prefix={<PrefixIcon><i className="fi fi-rr-search"></i></PrefixIcon>}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 250 }}
                                allowClear
                            />
                            <Button
                                icon={<PrefixIcon><i className="fi fi-rr-refresh"></i></PrefixIcon>}
                                onClick={fetchData}
                            >
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<PrefixIcon><i className="fi fi-rr-plus"></i></PrefixIcon>}
                                onClick={() => setAddModalVisible(true)}
                            >
                                Add Root Category
                            </Button>
                        </Space>
                    </Col>
                </Row>
            }
        >
            <div className={styles.categoryTable}>
                <Table
                    columns={columns}
                    dataSource={filteredCategories}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} categories`,
                    }}
                    bordered
                    expandable={{
                        expandedRowRender,
                        expandedRowKeys,
                        onExpandedRowsChange: (expandedKeys) => {
                            setExpandedRowKeys(expandedKeys);
                        },
                        expandRowByClick: false,
                        rowExpandable: (record) => hasChildren(record),
                        expandIcon: ({ expanded, onExpand, record }) => {
                            if (!hasChildren(record)) return null;
                            return (
                                <span 
                                    className={`${styles.expandIcon} ${expanded ? styles.expanded : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExpand(record, e);
                                    }}
                                >
                                    <i className="fi fi-rr-angle-small-right"></i>
                                </span>
                            );
                        },
                    }}
                    rowClassName={(record) => {
                        if (hasChildren(record)) {
                            return expandedRowKeys.includes(record.id) 
                                ? 'parent-row-expanded' 
                                : 'parent-row';
                        }
                        return '';
                    }}
                    onRow={(record) => ({
                        style: {
                            transition: 'all 0.25s ease-in-out',
                        }
                    })}
                />
            </div>

            <CategoryAddRootModal
                state={addModalVisible}
                setState={setAddModalVisible}
                onAdd={handleAddCategory}
            />

            {selectedCategory && (
                <CategoryEditModal
                    state={editModalVisible}
                    setState={setEditModalVisible}
                    category={selectedCategory}
                    onUpdate={handleEditCategory}
                />
            )}
        </Card>
    );
}

export default AdminCategoryManagePage;