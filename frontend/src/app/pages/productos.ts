import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto } from '../models';
import { Store } from '../store';

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="encabezado">
      <div>
        <h1>Catálogo</h1>
        <p class="ayuda">Agrega productos a tu lista o administra el catálogo.</p>
      </div>
      <button type="button" class="btn" (click)="abrir()">Nuevo producto</button>
    </div>

    <div class="herramientas">
      <label class="campo">
        <span>Buscar</span>
        <input
          type="search"
          placeholder="Nombre o categoría"
          [value]="filtro()"
          (input)="filtro.set($any($event.target).value)"
        />
      </label>
    </div>

    @if (store.cargando()) {
      <p class="estado">Cargando catálogo…</p>
    } @else if (!store.productos().length) {
      <div class="estado">
        <p>Todavía no hay productos en el catálogo.</p>
        <button type="button" class="btn" (click)="abrir()">Crear el primero</button>
      </div>
    } @else if (!visibles().length) {
      <p class="estado">Ningún producto coincide con «{{ filtro() }}».</p>
    } @else {
      <ul class="lista">
        <li class="fila cabecera productos" aria-hidden="true">
          <span>Producto</span>
          <span>Categoría</span>
          <span class="num">Precio</span>
          <span class="num">Stock</span>
          <span></span>
        </li>
        @for (p of visibles(); track p.id) {
          <li class="fila productos" [class.en-lista]="store.deseoPorProducto().has(p.id!)">
            <div class="principal">
              <strong class="nombre"
                ><span class="marca">{{ p.nombre }}</span></strong
              >
              @if (p.descripcion) {
                <span class="desc">{{ p.descripcion }}</span>
              }
            </div>
            <span class="cat">{{ p.categoria }}</span>
            <span class="num">{{ p.precio | currency: undefined : 'symbol-narrow' : '1.0-0' }}</span>
            <span class="num">
              @if (!p.activo) {
                <span class="etiqueta">Inactivo</span>
              } @else if (p.stock < 1) {
                <span class="etiqueta peligro">Agotado</span>
              } @else {
                {{ p.stock }}
              }
            </span>
            <div class="acciones">
              @if (store.deseoPorProducto().get(p.id!); as d) {
                <button
                  type="button"
                  class="btn sec"
                  [disabled]="store.ocupado()"
                  (click)="store.quitar(d)"
                >
                  Quitar de mi lista
                </button>
              } @else {
                <button
                  type="button"
                  class="btn"
                  [disabled]="store.ocupado() || !p.activo || p.stock < 1"
                  (click)="store.agregar(p)"
                >
                  Agregar a mi lista
                </button>
              }
              <button type="button" class="btn texto" (click)="abrir(p)">Editar</button>
              <button
                type="button"
                class="btn texto peligro"
                [disabled]="store.ocupado()"
                (click)="eliminar(p)"
              >
                Eliminar
              </button>
            </div>
          </li>
        }
      </ul>
    }

    <dialog #dlg class="dialogo" aria-labelledby="titulo-form">
      <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
        <h2 id="titulo-form">{{ editandoId() === null ? 'Nuevo producto' : 'Editar producto' }}</h2>

        <label class="campo">
          <span>Nombre</span>
          <input type="text" formControlName="nombre" autocomplete="off" />
          @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
            <small class="error">Escribe un nombre.</small>
          }
        </label>

        <label class="campo">
          <span>Descripción</span>
          <input type="text" formControlName="descripcion" autocomplete="off" />
        </label>

        <div class="dos">
          <label class="campo">
            <span>Precio</span>
            <input type="number" min="0" step="any" formControlName="precio" />
            @if (form.controls.precio.touched && form.controls.precio.invalid) {
              <small class="error">Ingresa un precio de 0 o más.</small>
            }
          </label>
          <label class="campo">
            <span>Stock</span>
            <input type="number" min="0" step="1" formControlName="stock" />
            @if (form.controls.stock.touched && form.controls.stock.invalid) {
              <small class="error">Ingresa un número entero de 0 o más.</small>
            }
          </label>
        </div>

        <label class="campo">
          <span>Categoría</span>
          <input type="text" formControlName="categoria" autocomplete="off" />
        </label>

        <label class="check">
          <input type="checkbox" formControlName="activo" />
          <span>Producto activo (si lo desactivas, deja de aparecer en el catálogo)</span>
        </label>

        @if (errorForm()) {
          <p class="error" role="alert">{{ errorForm() }}</p>
        }

        <div class="pie">
          <button type="button" class="btn sec" (click)="cerrar()">Cancelar</button>
          <button type="submit" class="btn" [disabled]="guardando()">Guardar producto</button>
        </div>
      </form>
    </dialog>
  `,
})
export class ProductosPage {
  protected readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  protected readonly filtro = signal('');
  protected readonly editandoId = signal<number | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal<string | null>(null);

  protected readonly visibles = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    const lista = this.store.productos();
    if (!q) return lista;
    return lista.filter((p) => `${p.nombre} ${p.categoria ?? ''}`.toLowerCase().includes(q));
  });

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    categoria: [''],
    activo: [true],
  });

  protected abrir(p?: Producto) {
    this.editandoId.set(p?.id ?? null);
    this.errorForm.set(null);
    this.form.reset({
      nombre: p?.nombre ?? '',
      descripcion: p?.descripcion ?? '',
      precio: p?.precio ?? 0,
      stock: p?.stock ?? 0,
      categoria: p?.categoria ?? '',
      activo: p?.activo ?? true,
    });
    this.dialogo().nativeElement.showModal();
  }

  protected cerrar() {
    this.dialogo().nativeElement.close();
  }

  protected async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorForm.set(null);
    const v = this.form.getRawValue();
    const error = await this.store.guardarProducto(this.editandoId(), {
      ...v,
      descripcion: v.descripcion.trim() || null,
      categoria: v.categoria.trim() || null,
    });
    this.guardando.set(false);
    if (error) this.errorForm.set(error);
    else this.cerrar();
  }

  protected async eliminar(p: Producto) {
    if (confirm(`¿Eliminar «${p.nombre}» del catálogo? Las listas que ya lo incluyen no se modifican.`)) {
      await this.store.eliminarProducto(p);
    }
  }
}
