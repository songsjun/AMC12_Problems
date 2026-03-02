# 2018 AMC 12B Problem 17

## Problem
Let p and q be positive integers such that $\frac{5}{9} < \frac{p}{q} < \frac{4}{7}$and q is as small as possible. What is q-p?

$\textbf{(A) } 7 \qquad \textbf{(B) } 11 \qquad \textbf{(C) } 13 \qquad \textbf{(D) } 17 \qquad \textbf{(E) } 19$
## Solution 1 (Generalization)
More generally, let a,b,c,d,p, and q be positive integers such that bc-ad=1 and $\frac$ ab < $\frac$ pq < $\frac$ cd.
From $\frac$ ab < $\frac$ pq, we have bp-aq>0, or bp-aq$\geq1. \hspace{15mm} (1)$
From $\frac$ pq < $\frac$ cd, we have cq-dp>0, or cq-dp$\geq1. \hspace{15mm} (2)$
Since bc-ad=1, note that:

 1.   Multiplying (1) by d, multiplying (2) by b, and adding the results, we get $q\geq$ b+d.

2.   Multiplying (1) by c, multiplying (2) by a, and adding the results, we get $p\geq$ a+c.

To minimize q, we set q=b+d, from which p=a+c. Together, we can prove that $\frac{a+c-1}{b+d}\leq\frac$ ab<$\frac{a+c}{b+d}<\frac$ cd$\leq\frac{a+c+1}{b+d}. \hspace{15mm} ($\bigstar)
For this problem, we have $a=5,b=9,c=4$, and $d=7$, so p=a+$c=9$ and q=b+$d=16$. The answer is $q-p=\boxed{\textbf{(A) } 7}.$

**Remark**

We will prove each part of the compound inequality in (\bigstar):

 1.   $\frac{a+c-1}{b+d}\leq\frac$ ab and $\frac$ cd$\leq\frac{a+c+1}{b+d}$

Let $\frac$ ab=k, so a=bk. The precondition bc-ad=1 becomes bc-bdk=1, so $c-dk=\frac1$b.

It follows that $\frac{a+c-1}{b+d}=\frac{bk+c-1}{b+d}=k+\frac{c-dk-1}{b+d}=k+\frac{\frac1b-1}{b+d}=k+\frac{1-b}{b(b+d)}\leq$ k. Moreover, the equality case occurs if and only if $b=1$.

We can prove $\frac$ cd$\leq\frac{a+c+1}{b+d}$ by the same process. Similarly, the equality case occurs if and only if $d=1. 2.   \frac$ ab<$\frac{a+c}{b+d}<\frac$ cd

Let $\fracab=k_1$ and $\fraccd=k_2$, so a=bk_1 and c=dk_2.

It follows that $\begin{alignat*}{10} \frac{a+c}{b+d}$&=$\frac{bk_1+dk_2}{b+d}$&&=k_$1+\frac{dk_2-dk_1}{b+d}$&&=k_$1+\frac{d(k_2-k_1)}{b+d}$&&>$k_$1, \\ $\frac{a+c}{b+d}$&=$\frac{bk_1+dk_2}{b+d}$&&=k_$2+\frac{bk_1-bk_2}{b+d}$&&=k_$2+\frac{b(k_1-k_2)}{b+d}$&& Moreover, this part of (\bigstar) is independent of the precondition bc-ad=1.

*~MRENTHUSIASM*
## Solution 2 (Generalization)
Define variables a,b,c,d,p, and q as Solution 1 does. Moreover, this solution refers to inequalities (1) and (2) in Solution 1.

Note that

$$
\begin{align*} \frac{1}{bd}&=\frac{bc-ad}{bd} \\ &=\frac cd - \frac ab \\ &=\left(\frac cd - \frac pq\right)+\left(\frac pq - \frac ab\right) \\ &=\frac{cq-dp}{dq}+\frac{bp-aq}{bp} \\ &\geq\frac{1}{dq}+\frac{1}{bq}. \end{align*}
$$

Multiplying both sides of $\frac{1}{bd}\geq\frac{1}{dq}+\frac{1}{bq}$ by bdq, we get $q\geq$ b+d.

For this problem, we have $a=5,b=9,c=4$, and $d=7$, so $q\geq$ b+$d=16. At q=16$, we have $\frac{8}{16}<\frac59<\frac{9}{16}<\frac47<\frac{10}{16},$
from which $p=9$. Therefore, the answer is $q-p=\boxed{\textbf{(A) } 7}.$

Alternatively, refer to the **Remark** section in Solution 1 for further generalizations.

*~pieater314159 ~MRENTHUSIASM*
## Solution 3 (Substitution)
Inverting the given inequality we get $\frac{7}{4} < \frac{q}{p} < \frac{9}{5},$
which simplifies to $35p<20q < 36p$.
We can now substitute q = p + k. Note we need to find k: $35p<20p + 20k<36p$,
which simplifies to $15p<20k < 16p$.
Clearly p>k. We will now substitute p = k + x to get $15k+15x < 20k<16k + 16x$.
The inequality $15k+15x < 20k$ simplifies to $3x$ < k.

The inequality $20k<16k + 16x$ simplifies to k < $4x$.

Combining the two inequalities, we get $3x$ < k < $4x$.
Since x and k are integers, the smallest values of x and k that satisfy the above equation are 2 and 7 respectively. Substituting these back in, we arrive with an answer of $\boxed{\textbf{(A) } 7}.$
## Solution 4 (Substitution)
Because q and p are positive integers with p we can let q=p+k where $k\in{\mathbb{Z}}.$ Now, the problem condition reduces to $\frac{5}{9}<\frac{p}{p+k}<\frac{4}{7}.$ Our first inequality is $\frac{5}{9}<\frac{p}{p+k},$ which gives us $5p+$5k<$9p$, or $\frac{5}{4}$k Our second inequality is $\frac{p}{p+k}<\frac{4}{7},$ which gives us $7p<4p+4$k, or p<$\frac{4}{3}$k. Hence, we have $\frac{5}{4}$k or $15k<$12p<$16k$. It is clear that we are aiming to find the least positive integer value of k such that there is at least one value of p that satisfies the inequality. Now, simple casework through the answer choices of the problem reveals that $q-p=p+k-p=k\ge{\boxed{\textbf{(A) } 7}}.$
## Solution 5 (Manipulation)
Subtract $\frac{1}{2}$ from both sides of the equation. This implies that $\frac{1}{18} < \frac{p}{q}-\frac{1}{2} < \frac{1}{14}.$ Then for q to be minimized, $\frac{p}{q}-\frac{1}{2}$ must be $\frac{1}{16},$ so $\frac{p}{q}$ is $\frac{9}{16}$ and q-p is $\boxed{\textbf{(A) } 7}.$ ~purplepenguin2 and clever14710owl
## Solution 6 (Solves for p)
Cross-multiply the inequality to get $35q<63p < 36q$. Then, we have $0 < 63p-35q$ < q, or $0 < 7(9p-5q)$ < q. Since p and q are integers, $9p-5$q is an integer. To minimize q, start from $9p-5$q=1, which gives $p=\frac{5q+1}{9}.$ This limits q to be greater than 7, so test values of q starting from $q=8$. However, $q=8 to q=14$ do not give integer values of p. Once q>14, it is possible for 9$p-5$q to be equal to 2, so p could also be equal to $\frac{5q+2}{9}.$ The next value, $q=15$, is not a solution, but $q=16$ gives $p=\frac{5\cdot 16 + 1}{9} = 9.$ Thus, the smallest possible value of q is 16, and the answer is $16-9=\boxed{\textbf{(A) } 7}.$
## Solution 7 (Inspection)
Start with $\frac{5}{9}.$ Repeat the following process until you arrive at the answer: if the fraction is less than or equal to $\frac{5}{9},$ add 1 to the numerator; otherwise, if it is greater than or equal to $\frac{4}{7},$ add one 1 to the denominator. We have $\frac{5}{9}, \frac{6}{9}, \frac{6}{10}, \frac{6}{11}, \frac{7}{11}, \frac{7}{12}, \frac{7}{13}, \frac{8}{13}, \frac{8}{14}, \frac{8}{15}, \frac{9}{15}, \frac{9}{16}.$ Therefore, the answer is 16 - 9 = $\boxed{\textbf{(A) } 7}.$
## Solution 8 (Inspection)
Checking possible fractions within the interval can get us to the answer, but only if we do it with more skill. The interval can also be written as 0.5556 This represents fraction with the numerator a little bit more than half the denominator. Every fraction we consider must not exceed this range. The denominators to be considered are 9,10,11,12,$\ldots.$ We check $\frac{6}{10}, \frac{6}{11}, \frac{7}{12}, \frac{7}{13}, \frac{8}{15}, \frac{9}{16}.$ At this point we know that we've got our fraction and our answer is $16-9=\boxed{\textbf{(A) } 7}.$ The inspection was made faster by considering the fact that $\frac{a+1}{b+1}>\frac{a}{b}.$ So, once a fraction was gotten which was greater than $\frac{4}{7}$ we jump to the next denominator. We then make sure we consider fractions with higher positive difference between the denominator and numerator. And we also do not forget that the numerator must be greater than half of the denominator. ($\frac{8}{14}$ was obviously skipped because it is equal to $\frac{4}{7}.)$ ~OlutosinNGA
## Solution 9 (Graphing)
Graph the regions y > $\frac{5}{9}$x and y < $\frac{4}{7}$x. Note that the lattice point (16,9) is the smallest magnitude one which appears within the region bounded by the two graphs. Thus, our fraction is $\frac{9}{16}$ and the answer is $16-9=\boxed{\textbf{(A) } 7}.$ Remark: This also gives an intuitive geometric proof of the mediant using vectors.
## Solution 10 (Answer Choices)
As the other solutions do, the mediant $\frac{9}{16}$ is between the two fractions, with a difference of $\boxed{\textbf{(A) } 7}.$ Suppose that the answer was not $\textbf{(A)},$ then the answer must be $\textbf{(B)}$ or $\textbf{(C)}$ as otherwise p would be negative. Then, the possible fractions with lower denominator would be $\frac{k-11}{k}$ for $k=12$,13,14,15 and $\frac{k-13}{k}$ for $k=14$,15, which are clearly not anywhere close to $\frac{4}{7}\approx 0.6.$
## Solution 11 (Answer Choices)
In ascending order, we can use answer choices, values for q-p, as a method of figuring out our answer through the means of substitution. Let the assumed difference be 7. Then, $p=q-7$. We thus have two inequalities: $\frac{5}{9} < \frac{q-7}{q}$ and $\frac{q-7}{q} < \frac{4}{7}.$ Solving for q in these equalities, we get $\frac{63}{4} <$ q < $\frac{49}{3}.$ So, q is between 15.75 and $16.\overline{3},$ making it 16 as q is a positive integer (again, at this point, this is still an assumption). This would set $p=16-7=9$. Since $\frac{5}{9} < \frac{9}{16} < \frac{4}{7},$ the minimum difference is $\boxed{\textbf{(A) } 7}.$ ~mesmore
## Solution 12 (Educated Guess)
Assume that the difference $\frac{p}{q} - \frac{5}{9}$ results in a fraction of the form $\frac{1}{9q}.$ Then, $9p-5q = 1$. Also assume that the difference $\frac{4}{7} - \frac{p}{q}$ results in a fraction of the form $\frac{1}{7q}.$ Then, $4q-7p = 1$. Solving the system of equations yields $q=16$ and $p=9$. Therefore, the answer is $\boxed{\textbf{(A) } 7}.$ Refer to Solution 1 for the full justification.
## Solution 13
Notice the following property.  $\begin{cases} \frac{a}{b} > $1 &$\Rightarrow \frac{a}{b} > \frac{a + 1}{b + 1} > \frac{a + 2}{b + 2} > \cdots$ \\ $\frac{a}{b} < $1 &$\Rightarrow \frac{a}{b} < \frac{a + 1}{b + 1} < \frac{a + 2}{b + 2} < \cdots \end{cases}$  Using the property above, the following fact could be derived.  $\frac{35}{63} < \frac{36}{64} < \cdots < \frac{36}{63} \qquad \left( \because \lim_{x \rightarrow \infty} \frac{35 + x}{63 + x} = 1 \right)$  First, the range for x could be found:  $\begin{align*} \frac{35 + x}{63 + x}$ &= $\frac{36}{63}$ \\ 35 $\cdot 63 + $63x &= 36 $\cdot 63 + $36x \\ 27x &= 63 \\ x &= $\frac{7}{3}. \end{align*}$  In other words, the only possible value for x are 1 and 2. It is evident that q will be smallest when $x = 1$. Therefore, q - $p = 16-9 =\boxed{\textbf{(A) } 7}.$ ~MaPhyCom [https://www.youtube.com/watch?v=DlZjn090hr8 Video Explanation]
## See Also
