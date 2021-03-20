import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/clientes.service';
import { Caixa } from '../caixa';
import { Cliente } from '../cliente';

@Component({
  selector: 'app-clientes-list',
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.css']
})
export class ClientesListComponent implements OnInit {

  carregando: boolean = false;
  carregandoCaixas: boolean = false;
  deletando: boolean = false;
  adicionandoCaixa: boolean = false;

  // Formulario
  @ViewChild('table') table?: MatTable<any>;
  formulario: FormGroup;
  
  // Tabela
  colunas: string[] = ['id', 'nome', 'cnpj', 'endereco', 'caixas', 'acoes'];
  mostrarTabela: boolean = false;
  clientes: Cliente[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private service: ClientesService,
    private router: Router
  ) {
    this.formulario = this.formBuilder.group({
      nome: ['', Validators.nullValidator]
    });
  }

  ngOnInit(): void {
  }

  buscar(){
    this.carregando = true;
    this.mostrarTabela = false;
    let nome: string = this.formulario.value.nome;
    if(nome === null){
      nome='';
    }
    this.service
          .buscar(nome)
          .subscribe(
            response => {
              this.clientes = response;
              if(this.clientes.length === 0){
                this.snackBar.open('Nenhum resultado encontrado!', 'fechar', {
                  duration: 3000,
                  horizontalPosition: "center",
                  verticalPosition: "bottom",
                });
                this.carregando = false;
              }
              else {
                this.mostrarTabela = true;
                this.formulario.reset();
                this.carregando = false;
              }
            },
            error => {
              this.snackBar.open('Erro ao tentar buscar clientes!', 'fechar', {
                duration: 3000,
                horizontalPosition: "center",
                verticalPosition: "bottom",
              });
              this.carregando = false;
            }
          );
  }

  temCaixas(index: number, caixas: Caixa[]){
    if(caixas === undefined){
      this.clientes[index].caixas = [];
      return false;
    }else {
      return caixas.length > 0;
    }
  }

  caixasId(caixas: Caixa[]): any[]{
    const ids: any[] = [] ;
    caixas.forEach(caixa => {
      ids.push(caixa.id);
    });
    return ids;
  }

  buscarCaixas(index: number, clienteId: number){
    this.carregandoCaixas = true;
    this.service
          .buscarCaixasPorClienteId(clienteId)
          .subscribe(
            response => {
              const caixas = response;
              if(caixas.length > 0){
                this.clientes[index].caixas = caixas;
                this.carregandoCaixas = false;
              } 
              else {
                this.snackBar.open('Cliente não possui caixas!', 'fechar', {
                  duration: 3000,
                  horizontalPosition: "center",
                  verticalPosition: "bottom",
                });
                this.carregandoCaixas = false;
              }
            },
            error => {
              this.snackBar.open('Ocorreu um erro ao tentar buscar por caixas!', 'fechar', {
                duration: 3000,
                horizontalPosition: "center",
                verticalPosition: "bottom",
              });
              this.carregandoCaixas = false;
            }
          );
  }

  editar(id: number){
    this.router.navigate([`/clientes/form/${id}`]);
  }

  deletar(index: number, id: number){
    this.deletando = true;
    this.service
          .deletar(id)
          .subscribe(
            response => {
              this.snackBar.open('Cliente deletado com sucesso!', 'fechar', {
                duration: 3000,
                horizontalPosition: "center",
                verticalPosition: "bottom",
              });
              this.clientes.splice(index, 1);
              this.table?.renderRows();
              this.deletando = false;
            },
            error =>{
              this.snackBar.open('Erro ao tentar deletar o cliente!', 'fechar', {
                duration: 3000,
                horizontalPosition: "center",
                verticalPosition: "bottom",
              });
              this.deletando = false;
            }
          );
  }

  adicionarCaixa(index: number, idCliente: number){
    this.adicionandoCaixa = true;
    const caixa: Caixa = new Caixa;
    caixa.cliente = idCliente;
    this.service
          .salvarCaixa(caixa)
          .subscribe(
            response => {
              this.snackBar.open('Caixa adicionada com sucesso!', 'fechar', {
                duration: 3000,
                horizontalPosition: "center",
                verticalPosition: "bottom",
              });
              const caixas: any = this.clientes[index].caixas;
              caixas.push(response);
              this.clientes[index].caixas = caixas;
              this.adicionandoCaixa = false;
            },
            error => {
              this.snackBar.open('Erro ao tentar adicionar uma nova caixa!', 'fechar', {
                duration: 3000,
                horizontalPosition: "center",
                verticalPosition: "bottom",
              });
              this.adicionandoCaixa = false;
            }
          )
  }

}
