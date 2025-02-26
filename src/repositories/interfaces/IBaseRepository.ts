export interface IBaseRepository<T> {
  create(entity: T): Promise<T>
  update(entity: T): Promise<T>
  delete(id: number): Promise<void>
  findById(id: number): Promise<T | null>
  findAll(): Promise<T[]>
}
