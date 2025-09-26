
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Contract, Status, WithId } from '@/lib/types';
import { semanticSearch } from '@/ai/flows/semantic-search-flow';
import { useToast } from './use-toast';


interface ContractContextType {
    contracts: WithId<Contract>[];
    filteredContracts: WithId<Contract>[];
    activeFilter: Status | 'All';
    handleFilterChange: (filter: Status | 'All') => void;
    isLoading: boolean;
    isSearching: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleSemanticSearch: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [contracts, setContracts] = useState<WithId<Contract>[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<WithId<Contract>[]>([]);
    const [activeFilter, setActiveFilter] = useState<Status | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    
    const [isSemanticSearch, setIsSemanticSearch] = useState(false);
    const [semanticSearchResults, setSemanticSearchResults] = useState<string[]>([]);

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

        return () => unsubscribe();
    }, [firestore]);

    useEffect(() => {
        let results = contracts;

        // If semantic search is active, first filter by its results
        if (isSemanticSearch) {
             results = results.filter(contract => semanticSearchResults.includes(contract.id));
        }

        // Then, filter by status
        if (activeFilter !== 'All') {
            results = results.filter(contract => contract.status === activeFilter);
        }

        setFilteredContracts(results);
    }, [activeFilter, contracts, isSemanticSearch, semanticSearchResults]);

    const handleFilterChange = (filter: Status | 'All') => {
        setActiveFilter(filter);
        // Reset semantic search when changing filters for a cleaner UX
        if (isSemanticSearch) {
            setIsSemanticSearch(false);
            setSearchTerm('');
            setSemanticSearchResults([]);
        }
    };
    
    const handleSemanticSearch = useCallback(async () => {
        if (!searchTerm.trim()) {
            setIsSemanticSearch(false);
            setSemanticSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const contractsToSearch = contracts.map(c => ({ id: c.id, textContent: c.textContent }));
            const result = await semanticSearch({ query: searchTerm, contracts: contractsToSearch });
            
            setSemanticSearchResults(result.matchingContractIds);
            setIsSemanticSearch(true);

            toast({
                title: 'Search Complete',
                description: `Found ${result.matchingContractIds.length} relevant contract(s).`,
            });

        } catch (error) {
            console.error('Semantic search failed:', error);
            toast({
                variant: 'destructive',
                title: 'Search Failed',
                description: 'The AI search could not be completed.',
            });
            setIsSemanticSearch(false);
            setSemanticSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm, contracts, toast]);
    
    const value = {
        contracts,
        filteredContracts,
        activeFilter,
        handleFilterChange,
        isLoading,
        isSearching,
        searchTerm,
        setSearchTerm,
        handleSemanticSearch,
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

