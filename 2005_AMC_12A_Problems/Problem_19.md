# 2005 AMC 12A Problem 19

## Problem
A faulty car odometer proceeds from digit 3 to digit 5, always skipping the digit 4, regardless of position. For example, after traveling one mile the odometer changed from 000039 to 000050. If the odometer now reads 002005, how many miles has the car actually traveled?


$$(\mathrm {A}) \ 1404 \qquad (\mathrm {B}) \ 1462 \qquad (\mathrm {C})\ 1604 \qquad (\mathrm {D}) \ 1605 \qquad (\mathrm {E})\ 1804$$

## Solution
### Solution 1
We find the number of numbers with a 4 and subtract from 2005. Quick counting tells us that there are 200 numbers with a 4 in the hundreds place, 200 numbers with a 4 in the tens place, and 201 numbers with a 4 in the units place (counting 2004). Now we apply the [Principle of Inclusion-Exclusion](https://artofproblemsolving.com/wiki/index.php/Principle_of_Inclusion-Exclusion). There are 20 numbers with a 4 in the hundreds and in the tens, and 20 for both the other two [intersection](https://artofproblemsolving.com/wiki/index.php/intersection)s. The intersection of all three sets is just 2. So we get:

$$2005-(200+200+201-20-20-20+2) = 1462 \Longrightarrow \mathrm{(B)}$$
### Solution 2
Alternatively, consider that counting without the number 4 is almost equivalent to counting in base 9; only, in base 9, the number 9 is not counted. Since 4 is skipped, the symbol 5 represents 4 miles of travel, and we have traveled 2004_9 miles. By    base conversion, 2004_9=$9^3(2)+9^0(4)=729(2)+1(4)=1458+4=\boxed{1462}$
### Solution 3
Since any numbers containing one or more $4s$ were skipped, we need only to find the numbers that don't contain a 4 at all. First we consider 1 - 1999. Single digits are simply four digit numbers with a zero in all but the ones place (this concept applies to double and triple digits numbers as well). From 1 - 1999, we have 2 possibilities for the thousands place, and 9 possibilities for the hundreds, tens, and ones places. This is 2 $\cdot 9 \cdot 9 \cdot 9-1$ possibilities (because 0000 doesn't count) or 1457 numbers. From 2000 - 2005 there are 6 numbers, 5 of which don't contain a 4. Therefore the total is 1457 + 5, or 1462 $\Rightarrow \boxed{\text{B}}.$
### Solution 4
We seek to find    the amount of numbers that contain at least one 4, and subtract this number from 2005.

We can simply apply casework to this problem.

The amount of numbers with at least one 4 that are one or two digit numbers are 4,14,24,34,40-49,54,$\cdots,94$ which gives 19 numbers.

The amount of three digit numbers with at least one 4 is 8*$19+100=252$.

The amount of four digit numbers with at least one 4 is $252+1+19=272$

This, our answer is $2005-19-252-272=1462$, or $\boxed{B}.$

*~coolmath2017*
### Solution 5 (Super fast)
This is very analogous to base 9. But, in base 9, we don't have a 9. So, this means that these are equal except for that base 9 will be one more than the operation here. $2005_9 =5+0+0+1458 = 1463. 1463 - 1 = 1462$

Therefore, our answer is $\boxed$ {1462}

*~Arcticturn*
## See also
