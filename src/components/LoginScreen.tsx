import { motion } from 'framer-motion';
import { Shield, Crown, Users, Sword } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-amber-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">Wild Wolf Guild</CardTitle>
            <CardDescription className="text-gray-400">
              Black Desert Online Guild Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-300"
              >
                <Shield className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p>Secure Access</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center text-gray-300"
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p>Member Management</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-gray-300"
              >
                <Sword className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p>Event Planning</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center text-gray-300"
              >
                <Crown className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                <p>Guild Leadership</p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                onClick={login}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 transition-all duration-200 hover:scale-105"
              >
                Login to Guild System
              </Button>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs text-gray-500 text-center"
            >
              Secure authentication via Blink Platform
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};