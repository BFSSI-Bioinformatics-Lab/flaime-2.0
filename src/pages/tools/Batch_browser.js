import React from 'react'
// import ProductTable from '../../components/ProductTable'
import TempTable from "../../components/table/TempTable";
import { Container } from '@mui/material';

const Batch_browser = () => {

  return (
    <div>
      <Container>
        <h2>Batch_browser Page</h2>
          {/* <ProductTable /> */}
          <TempTable 
            rows={[]} 
            columns={[]} 
            onPageChange={async () => 0}
            onSearchChange={async () => 0}
          />
      </Container>
    </div>
  )
}

export default Batch_browser