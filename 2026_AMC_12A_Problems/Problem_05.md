# 2026 AMC 12A Problem 5

> This problem is the same as [2026 AMC 10A #7](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_7) and [2026 AMC 12A #5](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_5).

## Problem
How many ordered triples of positive integers $(x,y,z)$ satisfy both the following equations?



$$
x+y+z=31
$$



$$
x+3y+3z=41
$$


$\textbf{(A) } 4 \qquad\textbf{(B) } 5 \qquad\textbf{(C) } 6 \qquad\textbf{(D) } 7 \qquad\textbf{(E) } 8$

## Solution 1
Subtracting the first equation from the second equation gives


$$
2y+2z=10
$$




$$
y+z=5
$$


By the first equation, $x = 26$. The ordered pairs of positive integers $(y, z)$ such that $y + z = 5$ are $(1, 4)$, $(2, 3)$, $(3, 2)$, and $(4, 1)$. Therefore, there are $4$ ordered triples, or $\boxed{\textbf{(A)}}$
$\newline$
$\sim$cyrus825, minor $\LaTeX$ fixes and polishing by Voidling

## Solution 1.5
After getting $y+z=5$, we use stars and bars to see that there are $6$ non-negative options for $y$ and $z$. After subtracting the 2 cases where y or z equals $0$, our final answer is $6-2=4$ —> $\boxed{\textbf{(A)}}$

-Amon26

## Solution 2
Let $S = y + z$. Substituting into both equations gives the system $x + S = 31$ and $x + 3S = 41$.
Equating expressions for $x$ yields $31 - S = 41 - 3S \implies 2S = 10 \implies S = 5$, which fixes $x = 26$.
Since $y, z \in \mathbb{Z}^+$ must satisfy $y + z = 5$, we apply the Stars and Bars theorem for $k = 2$ parts.
The number of positive integer solutions $(y, z)$ is $\binom{5 - 1}{2 - 1} = \binom{4}{1} = 4$.
Because $x = 26$ is uniquely determined, there are exactly $\boxed{4}$ ordered triples $(x, y, z)$.

~Horseneck3

## Solution 3 (Gaussian Elimination/RREF)
The given system of two equations in three unkowns can be represented as an augmented $3 \times 4$ coefficient matrix. We apply Gaussian Elimination (row reduction) to produce an equivalent matrix in Reduced Row Echelon Form (RREF).

We begin by representing our system as the augmented $3 \times 4$ matrix:

\begin{bmatrix}
{1} & {1} & {1} & {31} \\
{1} & {3} & {3} & {41}
\end{bmatrix}

Apply Gaussian Elimination yields the resulting RREF matrix:

\begin{bmatrix}
{1} & {0} & {0} & {26} \\
{0} & {1} & {1} & {5}
\end{bmatrix}

Hence, we have that $x=26$ and that $y+z=5$. The only ordered pairs $(y,z)$ for which $y+z=5$ are $(1,4)$, $(2,3)$, $(3,2)$, and $(4,1)$. Thus, there are $\boxed{4}$ such ordered triples. 

~MaxTensen

## Solution 0 (Brute Force the Brute Force)
Note: If you are planning to read this solution, it will probably hurt your brain.

There are \(\binom{30}{2}=435\) possible ordered triples of positive integers \((x,y,z)\) that sum to 31. A mere 435 possibilities suggests the use of brute force to calculate and check all 435 outcomes in the 75 - minute exam.$\newline$
(1,1,29): 91 != 41 $\newline$
(1,2,28): 91 != 41 $\newline$
(1,3,27): 91 != 41 $\newline$
(1,4,26): 91 != 41 $\newline$
(1,5,25): 91 != 41 $\newline$
(1,6,24): 91 != 41 $\newline$
(1,7,23): 91 != 41 $\newline$
(1,8,22): 91 != 41 $\newline$
(1,9,21): 91 != 41 $\newline$
(1,10,20): 91 != 41 $\newline$
(1,11,19): 91 != 41 $\newline$
(1,12,18): 91 != 41 $\newline$
(1,13,17): 91 != 41 $\newline$
(1,14,16): 91 != 41 $\newline$
(1,15,15): 91 != 41 $\newline$
(1,16,14): 91 != 41 $\newline$
(1,17,13): 91 != 41 $\newline$
(1,18,12): 91 != 41 $\newline$
(1,19,11): 91 != 41 $\newline$
(1,20,10): 91 != 41 $\newline$
(1,21,9): 91 != 41 $\newline$
(1,22,8): 91 != 41 $\newline$
(1,23,7): 91 != 41 $\newline$
(1,24,6): 91 != 41 $\newline$
(1,25,5): 91 != 41 $\newline$
(1,26,4): 91 != 41 $\newline$
(1,27,3): 91 != 41 $\newline$
(1,28,2): 91 != 41 $\newline$
(1,29,1): 91 != 41 $\newline$

(2,1,28): 89 != 41 $\newline$
(2,2,27): 89 != 41 $\newline$
(2,3,26): 89 != 41 $\newline$
(2,4,25): 89 != 41 $\newline$
(2,5,24): 89 != 41 $\newline$
(2,6,23): 89 != 41 $\newline$
(2,7,22): 89 != 41 $\newline$
(2,8,21): 89 != 41 $\newline$
(2,9,20): 89 != 41 $\newline$
(2,10,19): 89 != 41 $\newline$
(2,11,18): 89 != 41 $\newline$
(2,12,17): 89 != 41 $\newline$
(2,13,16): 89 != 41 $\newline$
(2,14,15): 89 != 41 $\newline$
(2,15,14): 89 != 41 $\newline$
(2,16,13): 89 != 41 $\newline$
(2,17,12): 89 != 41 $\newline$
(2,18,11): 89 != 41 $\newline$
(2,19,10): 89 != 41 $\newline$
(2,20,9): 89 != 41 $\newline$
(2,21,8): 89 != 41 $\newline$
(2,22,7): 89 != 41 $\newline$
(2,23,6): 89 != 41 $\newline$
(2,24,5): 89 != 41 $\newline$
(2,25,4): 89 != 41 $\newline$
(2,26,3): 89 != 41 $\newline$
(2,27,2): 89 != 41 $\newline$
(2,28,1): 89 != 41 $\newline$

(3,1,27): 87 != 41 $\newline$
(3,2,26): 87 != 41 $\newline$
(3,3,25): 87 != 41 $\newline$
(3,4,24): 87 != 41 $\newline$
(3,5,23): 87 != 41 $\newline$
(3,6,22): 87 != 41 $\newline$
(3,7,21): 87 != 41 $\newline$
(3,8,20): 87 != 41 $\newline$
(3,9,19): 87 != 41 $\newline$
(3,10,18): 87 != 41 $\newline$
(3,11,17): 87 != 41 $\newline$
(3,12,16): 87 != 41 $\newline$
(3,13,15): 87 != 41 $\newline$
(3,14,14): 87 != 41 $\newline$
(3,15,13): 87 != 41 $\newline$
(3,16,12): 87 != 41 $\newline$
(3,17,11): 87 != 41 $\newline$
(3,18,10): 87 != 41 $\newline$
(3,19,9): 87 != 41 $\newline$
(3,20,8): 87 != 41 $\newline$
(3,21,7): 87 != 41 $\newline$
(3,22,6): 87 != 41 $\newline$
(3,23,5): 87 != 41 $\newline$
(3,24,4): 87 != 41 $\newline$
(3,25,3): 87 != 41 $\newline$
(3,26,2): 87 != 41 $\newline$
(3,27,1): 87 != 41 $\newline$

(4,1,26): 85 != 41 $\newline$
(4,2,25): 85 != 41 $\newline$
(4,3,24): 85 != 41 $\newline$
(4,4,23): 85 != 41 $\newline$
(4,5,22): 85 != 41 $\newline$
(4,6,21): 85 != 41 $\newline$
(4,7,20): 85 != 41 $\newline$
(4,8,19): 85 != 41 $\newline$
(4,9,18): 85 != 41 $\newline$
(4,10,17): 85 != 41 $\newline$
(4,11,16): 85 != 41 $\newline$
(4,12,15): 85 != 41 $\newline$
(4,13,14): 85 != 41 $\newline$
(4,14,13): 85 != 41 $\newline$
(4,15,12): 85 != 41 $\newline$
(4,16,11): 85 != 41 $\newline$
(4,17,10): 85 != 41 $\newline$
(4,18,9): 85 != 41 $\newline$
(4,19,8): 85 != 41 $\newline$
(4,20,7): 85 != 41 $\newline$
(4,21,6): 85 != 41 $\newline$
(4,22,5): 85 != 41 $\newline$
(4,23,4): 85 != 41 $\newline$
(4,24,3): 85 != 41 $\newline$
(4,25,2): 85 != 41 $\newline$
(4,26,1): 85 != 41 $\newline$

(5,1,25): 83 != 41 $\newline$
(5,2,24): 83 != 41 $\newline$
(5,3,23): 83 != 41 $\newline$
(5,4,22): 83 != 41 $\newline$
(5,5,21): 83 != 41 $\newline$
(5,6,20): 83 != 41 $\newline$
(5,7,19): 83 != 41 $\newline$
(5,8,18): 83 != 41 $\newline$
(5,9,17): 83 != 41 $\newline$
(5,10,16): 83 != 41 $\newline$
(5,11,15): 83 != 41 $\newline$
(5,12,14): 83 != 41 $\newline$
(5,13,13): 83 != 41 $\newline$
(5,14,12): 83 != 41 $\newline$
(5,15,11): 83 != 41 $\newline$
(5,16,10): 83 != 41 $\newline$
(5,17,9): 83 != 41 $\newline$
(5,18,8): 83 != 41 $\newline$
(5,19,7): 83 != 41 $\newline$
(5,20,6): 83 != 41 $\newline$
(5,21,5): 83 != 41 $\newline$
(5,22,4): 83 != 41 $\newline$
(5,23,3): 83 != 41 $\newline$
(5,24,2): 83 != 41 $\newline$
(5,25,1): 83 != 41 $\newline$

(6,1,24): 81 != 41 $\newline$
(6,2,23): 81 != 41 $\newline$
(6,3,22): 81 != 41 $\newline$
(6,4,21): 81 != 41 $\newline$
(6,5,20): 81 != 41 $\newline$
(6,6,19): 81 != 41 $\newline$
(6,7,18): 81 != 41 $\newline$
(6,8,17): 81 != 41 $\newline$
(6,9,16): 81 != 41 $\newline$
(6,10,15): 81 != 41 $\newline$
(6,11,14): 81 != 41 $\newline$
(6,12,13): 81 != 41 $\newline$
(6,13,12): 81 != 41 $\newline$
(6,14,11): 81 != 41 $\newline$
(6,15,10): 81 != 41 $\newline$
(6,16,9): 81 != 41 $\newline$
(6,17,8): 81 != 41 $\newline$
(6,18,7): 81 != 41 $\newline$
(6,19,6): 81 != 41 $\newline$
(6,20,5): 81 != 41 $\newline$
(6,21,4): 81 != 41 $\newline$
(6,22,3): 81 != 41 $\newline$
(6,23,2): 81 != 41 $\newline$
(6,24,1): 81 != 41 $\newline$

(7,1,23): 79 != 41 $\newline$
(7,2,22): 79 != 41 $\newline$
(7,3,21): 79 != 41 $\newline$
(7,4,20): 79 != 41 $\newline$
(7,5,19): 79 != 41 $\newline$
(7,6,18): 79 != 41 $\newline$
(7,7,17): 79 != 41 $\newline$
(7,8,16): 79 != 41 $\newline$
(7,9,15): 79 != 41 $\newline$
(7,10,14): 79 != 41 $\newline$
(7,11,13): 79 != 41 $\newline$
(7,12,12): 79 != 41 $\newline$
(7,13,11): 79 != 41 $\newline$
(7,14,10): 79 != 41 $\newline$
(7,15,9): 79 != 41 $\newline$
(7,16,8): 79 != 41 $\newline$
(7,17,7): 79 != 41 $\newline$
(7,18,6): 79 != 41 $\newline$
(7,19,5): 79 != 41 $\newline$
(7,20,4): 79 != 41 $\newline$
(7,21,3): 79 != 41 $\newline$
(7,22,2): 79 != 41 $\newline$
(7,23,1): 79 != 41 $\newline$

(8,1,22): 77 != 41 $\newline$
(8,2,21): 77 != 41 $\newline$
(8,3,20): 77 != 41 $\newline$
(8,4,19): 77 != 41 $\newline$
(8,5,18): 77 != 41 $\newline$
(8,6,17): 77 != 41 $\newline$
(8,7,16): 77 != 41 $\newline$
(8,8,15): 77 != 41 $\newline$
(8,9,14): 77 != 41 $\newline$
(8,10,13): 77 != 41 $\newline$
(8,11,12): 77 != 41 $\newline$
(8,12,11): 77 != 41 $\newline$
(8,13,10): 77 != 41 $\newline$
(8,14,9): 77 != 41 $\newline$
(8,15,8): 77 != 41 $\newline$
(8,16,7): 77 != 41 $\newline$
(8,17,6): 77 != 41 $\newline$
(8,18,5): 77 != 41 $\newline$
(8,19,4): 77 != 41 $\newline$
(8,20,3): 77 != 41 $\newline$
(8,21,2): 77 != 41 $\newline$
(8,22,1): 77 != 41 $\newline$

(9,1,21): 75 != 41 $\newline$
(9,2,20): 75 != 41 $\newline$
(9,3,19): 75 != 41 $\newline$
(9,4,18): 75 != 41 $\newline$
(9,5,17): 75 != 41 $\newline$
(9,6,16): 75 != 41 $\newline$
(9,7,15): 75 != 41 $\newline$
(9,8,14): 75 != 41 $\newline$
(9,9,13): 75 != 41 $\newline$
(9,10,12): 75 != 41 $\newline$
(9,11,11): 75 != 41 $\newline$
(9,12,10): 75 != 41 $\newline$
(9,13,9): 75 != 41 $\newline$
(9,14,8): 75 != 41 $\newline$
(9,15,7): 75 != 41 $\newline$
(9,16,6): 75 != 41 $\newline$
(9,17,5): 75 != 41 $\newline$
(9,18,4): 75 != 41 $\newline$
(9,19,3): 75 != 41 $\newline$
(9,20,2): 75 != 41 $\newline$
(9,21,1): 75 != 41 $\newline$

(10,1,20): 73 != 41 $\newline$
(10,2,19): 73 != 41 $\newline$
(10,3,18): 73 != 41 $\newline$
(10,4,17): 73 != 41 $\newline$
(10,5,16): 73 != 41 $\newline$
(10,6,15): 73 != 41 $\newline$
(10,7,14): 73 != 41 $\newline$
(10,8,13): 73 != 41 $\newline$
(10,9,12): 73 != 41 $\newline$
(10,10,11): 73 != 41 $\newline$
(10,11,10): 73 != 41 $\newline$
(10,12,9): 73 != 41 $\newline$
(10,13,8): 73 != 41 $\newline$
(10,14,7): 73 != 41 $\newline$
(10,15,6): 73 != 41 $\newline$
(10,16,5): 73 != 41 $\newline$
(10,17,4): 73 != 41 $\newline$
(10,18,3): 73 != 41 $\newline$
(10,19,2): 73 != 41 $\newline$
(10,20,1): 73 != 41 $\newline$

(11,1,19): 71 != 41 $\newline$
(11,2,18): 71 != 41 $\newline$
(11,3,17): 71 != 41 $\newline$
(11,4,16): 71 != 41 $\newline$
(11,5,15): 71 != 41 $\newline$
(11,6,14): 71 != 41 $\newline$
(11,7,13): 71 != 41 $\newline$
(11,8,12): 71 != 41 $\newline$
(11,9,11): 71 != 41 $\newline$
(11,10,10): 71 != 41 $\newline$
(11,11,9): 71 != 41 $\newline$
(11,12,8): 71 != 41 $\newline$
(11,13,7): 71 != 41 $\newline$
(11,14,6): 71 != 41 $\newline$
(11,15,5): 71 != 41 $\newline$
(11,16,4): 71 != 41 $\newline$
(11,17,3): 71 != 41 $\newline$
(11,18,2): 71 != 41 $\newline$
(11,19,1): 71 != 41 $\newline$

(12,1,18): 69 != 41 $\newline$
(12,2,17): 69 != 41 $\newline$
(12,3,16): 69 != 41 $\newline$
(12,4,15): 69 != 41 $\newline$
(12,5,14): 69 != 41 $\newline$
(12,6,13): 69 != 41 $\newline$
(12,7,12): 69 != 41 $\newline$
(12,8,11): 69 != 41 $\newline$
(12,9,10): 69 != 41 $\newline$
(12,10,9): 69 != 41 $\newline$
(12,11,8): 69 != 41 $\newline$
(12,12,7): 69 != 41 $\newline$
(12,13,6): 69 != 41 $\newline$
(12,14,5): 69 != 41 $\newline$
(12,15,4): 69 != 41 $\newline$
(12,16,3): 69 != 41 $\newline$
(12,17,2): 69 != 41 $\newline$
(12,18,1): 69 != 41 $\newline$

(13,1,17): 67 != 41 $\newline$
(13,2,16): 67 != 41 $\newline$
(13,3,15): 67 != 41 $\newline$
(13,4,14): 67 != 41 $\newline$
(13,5,13): 67 != 41 $\newline$
(13,6,12): 67 != 41 $\newline$
(13,7,11): 67 != 41 $\newline$
(13,8,10): 67 != 41 $\newline$
(13,9,9): 67 != 41 $\newline$
(13,10,8): 67 != 41 $\newline$
(13,11,7): 67 != 41 $\newline$
(13,12,6): 67 != 41 $\newline$
(13,13,5): 67 != 41 $\newline$
(13,14,4): 67 != 41 $\newline$
(13,15,3): 67 != 41 $\newline$
(13,16,2): 67 != 41 $\newline$
(13,17,1): 67 != 41 $\newline$

(14,1,16): 65 != 41 $\newline$
(14,2,15): 65 != 41 $\newline$
(14,3,14): 65 != 41 $\newline$
(14,4,13): 65 != 41 $\newline$
(14,5,12): 65 != 41 $\newline$
(14,6,11): 65 != 41 $\newline$
(14,7,10): 65 != 41 $\newline$
(14,8,9): 65 != 41 $\newline$
(14,9,8): 65 != 41 $\newline$
(14,10,7): 65 != 41 $\newline$
(14,11,6): 65 != 41 $\newline$
(14,12,5): 65 != 41 $\newline$
(14,13,4): 65 != 41 $\newline$
(14,14,3): 65 != 41 $\newline$
(14,15,2): 65 != 41 $\newline$
(14,16,1): 65 != 41 $\newline$

(15,1,15): 63 != 41 $\newline$
(15,2,14): 63 != 41 $\newline$
(15,3,13): 63 != 41 $\newline$
(15,4,12): 63 != 41 $\newline$
(15,5,11): 63 != 41 $\newline$
(15,6,10): 63 != 41 $\newline$
(15,7,9): 63 != 41 $\newline$
(15,8,8): 63 != 41 $\newline$
(15,9,7): 63 != 41 $\newline$
(15,10,6): 63 != 41 $\newline$
(15,11,5): 63 != 41 $\newline$
(15,12,4): 63 != 41 $\newline$
(15,13,3): 63 != 41 $\newline$
(15,14,2): 63 != 41 $\newline$
(15,15,1): 63 != 41 $\newline$

(16,1,14): 61 != 41 $\newline$
(16,2,13): 61 != 41 $\newline$
(16,3,12): 61 != 41 $\newline$
(16,4,11): 61 != 41 $\newline$
(16,5,10): 61 != 41 $\newline$
(16,6,9): 61 != 41 $\newline$
(16,7,8): 61 != 41 $\newline$
(16,8,7): 61 != 41 $\newline$
(16,9,6): 61 != 41 $\newline$
(16,10,5): 61 != 41 $\newline$
(16,11,4): 61 != 41 $\newline$
(16,12,3): 61 != 41 $\newline$
(16,13,2): 61 != 41 $\newline$
(16,14,1): 61 != 41 $\newline$

(17,1,13): 59 != 41 $\newline$
(17,2,12): 59 != 41 $\newline$
(17,3,11): 59 != 41 $\newline$
(17,4,10): 59 != 41 $\newline$
(17,5,9): 59 != 41 $\newline$
(17,6,8): 59 != 41 $\newline$
(17,7,7): 59 != 41 $\newline$
(17,8,6): 59 != 41 $\newline$
(17,9,5): 59 != 41 $\newline$
(17,10,4): 59 != 41 $\newline$
(17,11,3): 59 != 41 $\newline$
(17,12,2): 59 != 41 $\newline$
(17,13,1): 59 != 41 $\newline$

(18,1,12): 57 != 41 $\newline$
(18,2,11): 57 != 41 $\newline$
(18,3,10): 57 != 41 $\newline$
(18,4,9): 57 != 41 $\newline$
(18,5,8): 57 != 41 $\newline$
(18,6,7): 57 != 41 $\newline$
(18,7,6): 57 != 41 $\newline$
(18,8,5): 57 != 41 $\newline$
(18,9,4): 57 != 41 $\newline$
(18,10,3): 57 != 41 $\newline$
(18,11,2): 57 != 41 $\newline$
(18,12,1): 57 != 41 $\newline$

(19,1,11): 55 != 41 $\newline$
(19,2,10): 55 != 41 $\newline$
(19,3,9): 55 != 41 $\newline$
(19,4,8): 55 != 41 $\newline$
(19,5,7): 55 != 41 $\newline$
(19,6,6): 55 != 41 $\newline$
(19,7,5): 55 != 41 $\newline$
(19,8,4): 55 != 41 $\newline$
(19,9,3): 55 != 41 $\newline$
(19,10,2): 55 != 41 $\newline$
(19,11,1): 55 != 41 $\newline$

(20,1,10): 53 != 41 $\newline$
(20,2,9): 53 != 41 $\newline$
(20,3,8): 53 != 41 $\newline$
(20,4,7): 53 != 41 $\newline$
(20,5,6): 53 != 41 $\newline$
(20,6,5): 53 != 41 $\newline$
(20,7,4): 53 != 41 $\newline$
(20,8,3): 53 != 41 $\newline$
(20,9,2): 53 != 41 $\newline$
(20,10,1): 53 != 41 $\newline$

(21,1,9): 51 != 41 $\newline$
(21,2,8): 51 != 41 $\newline$
(21,3,7): 51 != 41 $\newline$
(21,4,6): 51 != 41 $\newline$
(21,5,5): 51 != 41 $\newline$
(21,6,4): 51 != 41 $\newline$
(21,7,3): 51 != 41 $\newline$
(21,8,2): 51 != 41 $\newline$
(21,9,1): 51 != 41 $\newline$

(22,1,8): 49 != 41 $\newline$
(22,2,7): 49 != 41 $\newline$
(22,3,6): 49 != 41 $\newline$
(22,4,5): 49 != 41 $\newline$
(22,5,4): 49 != 41 $\newline$
(22,6,3): 49 != 41 $\newline$
(22,7,2): 49 != 41 $\newline$
(22,8,1): 49 != 41 $\newline$

(23,1,7): 47 != 41 $\newline$
(23,2,6): 47 != 41 $\newline$
(23,3,5): 47 != 41 $\newline$
(23,4,4): 47 != 41 $\newline$
(23,5,3): 47 != 41 $\newline$
(23,6,2): 47 != 41 $\newline$
(23,7,1): 47 != 41 $\newline$

(24,1,6): 45 != 41 $\newline$
(24,2,5): 45 != 41 $\newline$
(24,3,4): 45 != 41 $\newline$
(24,4,3): 45 != 41 $\newline$
(24,5,2): 45 != 41 $\newline$
(24,6,1): 45 != 41 $\newline$

(25,1,5): 43 != 41 $\newline$
(25,2,4): 43 != 41 $\newline$
(25,3,3): 43 != 41 $\newline$
(25,4,2): 43 != 41 $\newline$
(25,5,1): 43 != 41 $\newline$

(26,1,4): 41 = 41 $\newline$
(26,2,3): 41 = 41 $\newline$
(26,3,2): 41 = 41 $\newline$
(26,4,1): 41 = 41 $\newline$

(27,1,3): 39 != 41 $\newline$
(27,2,2): 39 != 41 $\newline$
(27,3,1): 39 != 41 $\newline$

(28,1,2): 37 != 41 $\newline$
(28,2,1): 37 != 41 $\newline$

(29,1,1): 35 != 41 $\newline$
In total, there are $4$ ordered triples, so the answer is $\boxed{\textbf{(A)}}$$\newline$
$\sim$Imperial Films YT (Unemployed)

## Video Solution 1
https://youtu.be/sNFSsL75LGE?t=642

~MathisFun

## Video Solution 2 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
