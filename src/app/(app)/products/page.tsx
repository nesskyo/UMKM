"use client"
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentBusinessId } from "@/lib/business";
import type { Product, ProductCategory, ProductWithCategory } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

function getProductStatus(stock: number, minStock: number) {
  if (stock <= 0) return "Out of Stock" as const;
  if (stock <= minStock) return "Low Stock" as const;
  return "Available" as const;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [savedProduct, setSavedProduct] = useState<ProductWithCategory | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    minStock: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: catData } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");
      setCategories(catData ?? []);

      const businessId = await getCurrentBusinessId();
      if (!businessId) return;

      const { data } = await supabase
        .from("products")
        .select("*, product_categories(*)")
        .eq("business_id", businessId);
      const rows = (data ?? []) as (Product & { product_categories: ProductCategory })[];
      setProducts(rows.map((p) => ({ ...p, status: getProductStatus(p.stock, p.min_stock) })));
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSaveProduct = async () => {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      setFeedback("Bisnis tidak ditemukan. Perbarui profil bisnis Anda terlebih dahulu.");
      return;
    }

    const validated = {
      name: newProduct.name || "Produk Baru",
      categoryId: newProduct.categoryId || categories[0]?.id,
      price: parseInt(newProduct.price) || 0,
      stock: parseInt(newProduct.stock) || 0,
      minStock: parseInt(newProduct.minStock) || 0,
    };

    const { data, error } = await supabase
      .from("products")
      .insert({
        business_id: businessId,
        category_id: validated.categoryId,
        name: validated.name,
        price: validated.price,
        stock: validated.stock,
        min_stock: validated.minStock,
      })
      .select("*, product_categories(*)")
      .single();

    if (error) {
      setFeedback(`Gagal menyimpan: ${error.message}`);
      return;
    }

    const category = categories.find((c) => c.id === validated.categoryId);
    const saved: ProductWithCategory = {
      ...(data as Product),
      product_categories: category ?? { id: "", name: "", created_at: "" },
      status: getProductStatus(data.stock, data.min_stock),
    };

    setProducts((prev) => [saved, ...prev]);
    setSavedProduct(saved);
    setIsAddModalOpen(false);
    setIsQRModalOpen(true);
    setCategorySearch("");
    setNewProduct({ name: "", categoryId: "", price: "", stock: "", minStock: "" });
    setFeedback("Produk berhasil ditambahkan.");
  };

  const handleEditProduct = async (product: ProductWithCategory) => {
    const updatedStatus = getProductStatus(product.stock, product.min_stock);
    const { error } = await supabase
      .from("products")
      .update({ stock: product.stock, min_stock: product.min_stock })
      .eq("id", product.id);

    if (error) {
      setFeedback(`Gagal update: ${error.message}`);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: updatedStatus } : p))
    );
    setFeedback("Produk diperbarui.");
  };

  const columns = [
    { key: "id", header: "ID Produk", render: (item: ProductWithCategory) => shortId(item.id) },
    { key: "name", header: "Produk" },
    { key: "categoryName", header: "Kategori", render: (item: ProductWithCategory) => item.product_categories?.name ?? "-" },
    { key: "price", header: "Harga", render: (item: ProductWithCategory) => `Rp ${Number(item.price).toLocaleString('id-ID')}` },
    { key: "stock", header: "Stok" },
    { key: "min_stock", header: "Stok Minimum", render: (item: ProductWithCategory) => item.min_stock ?? "-" },
    {
      key: "status",
      header: "Status",
      render: (item: ProductWithCategory) => (
        <Badge variant={item.status === "Available" ? "success" : item.status === "Low Stock" ? "warning" : "critical"}>
          {item.status}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Aksi",
      render: (item: ProductWithCategory) => (
        <Button variant="ghost" size="sm" className="text-primary font-semibold" onClick={() => handleEditProduct(item)}>
          Edit
        </Button>
      )
    }
  ];

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-muted text-sm mt-1">Kelola data produk Anda di sini.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Produk
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <Input placeholder="Cari produk..." className="pl-10" />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      {feedback && <p className="text-sm text-success" role="status">{feedback}</p>}

      {loading ? (
        <p className="text-muted text-sm">Memuat produk...</p>
      ) : (
        <DataTable data={products} columns={columns} />
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Produk Baru"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveProduct}>Simpan Produk</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Produk</label>
            <Input
              placeholder="e.g. Kopi Vanilla"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Harga</label>
              <Input
                type="number"
                placeholder="20000"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <Input
                placeholder="Cari kategori..."
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                aria-label="Cari kategori"
              />
              <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200" role="listbox" aria-label="Daftar kategori">
                <div className="flex flex-col">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      role="option"
                      aria-selected={newProduct.categoryId === category.id}
                      onClick={() => setNewProduct({ ...newProduct, categoryId: category.id })}
                      className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors border-b last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${newProduct.categoryId === category.id ? "bg-primary/10 text-primary border-primary" : "hover:bg-gray-50 border-gray-200"}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                {filteredCategories.length === 0 && (
                  <p className="px-2 py-3 text-center text-sm text-muted">Kategori tidak ditemukan.</p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stok Saat Ini</label>
              <Input
                type="number"
                placeholder="50"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stok Minimum</label>
              <Input
                type="number"
                placeholder="10"
                value={newProduct.minStock}
                onChange={e => setNewProduct({ ...newProduct, minStock: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Produk Berhasil Ditambahkan"
        footer={
          <Button onClick={() => setIsQRModalOpen(false)}>Tutup</Button>
        }
      >
        <div className="flex flex-col items-center gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            {savedProduct && (
              <QRCodeCanvas
                value={JSON.stringify({
                  id: savedProduct.id,
                  name: savedProduct.name,
                })}
                size={200}
              />
            )}
          </div>
          <div className="w-full space-y-2 text-center">
            <h3 className="font-semibold text-lg">{savedProduct?.name}</h3>
            <p className="text-sm text-muted">ID: {savedProduct?.id}</p>
            <p className="text-sm text-muted">Kategori: {savedProduct?.product_categories?.name}</p>
            <p className="text-sm font-medium">Harga: Rp {Number(savedProduct?.price ?? 0).toLocaleString('id-ID')}</p>
            <p className="text-sm text-muted">Stok: {savedProduct?.stock} unit</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}