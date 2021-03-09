type ConfigurationId = string;

type Configuration = {
  id?: ConfigurationId;
  // TODO: Add the configuration schema from the frontend
};

type Pagination = {
  size: number;
  page: number;
};

type PaginationResponse<T> = {
  total: number;
  data: Array<T>;
};

export interface ClientConfigurationManager {
  create(configuration: Configuration): Promise<Configuration>;
  read(id: ConfigurationId): Promise<Configuration>;
  update(configuration: Configuration): Promise<Configuration>;
  delete(id: ConfigurationId): Promise<boolean>;
  list(pagination: Pagination): Promise<PaginationResponse<Configuration>>;
}
