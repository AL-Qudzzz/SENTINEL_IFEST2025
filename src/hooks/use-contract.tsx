'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Contract, Status, WithId } from '@/lib/types';

interface ContractContextType {
    contracts: WithId<Contract>[];
    filteredContracts: WithId<Contract>[];
    activeFilter: Status | 'All';
    handleFilterChange: (filter: Status | 'All') => void;
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
    const { firestore } = useFirebase();

    const [contracts, setContracts] = useState<WithId<Contract>[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<WithId<Contract>[]>([]);
    const [activeFilter, setActiveFilter] = useState<Status | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch data from Firestore on component mount and listen for real-time updates
    useEffect(() => {
        if (!firestore) return;

        setIsLoading(true);
        const contractsQuery = query(collection(firestore, "contracts"), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(contractsQuery, (querySnapshot) => {
            const contractsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as WithId<Contract>));
            
            setContracts(contractsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching contracts: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [firestore]);

    // 2. Perform filtering whenever 'activeFilter', 'searchTerm', or 'contracts' change
    useEffect(() => {
        let results = contracts;

        // Filter by status
        if (activeFilter !== 'All') {
            results = results.filter(contract => contract.status === activeFilter);
        }

        // Filter by search term
        if (searchTerm) {
            results = results.filter(contract => 
                contract.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredContracts(results);
    }, [activeFilter, searchTerm, contracts]);

    // 3. Function to change the filter, will be called by buttons
    const handleFilterChange = (filter: Status | 'All') => {
        setActiveFilter(filter);
    };
    
    const value = {
        contracts,
        filteredContracts,
        activeFilter,
        handleFilterChange,
        isLoading,
        searchTerm,
        setSearchTerm,
    };
    
    return (
        <ContractContext.Provider value={value}>
            {children}
        </ContractContext.Provider>
    );
};

export const useContract = (): ContractContextType => {
    const context = useContext(ContractContext);
    if (context === undefined) {
        throw new Error('useContract must be used within a ContractProvider');
    }
    return context;
};
